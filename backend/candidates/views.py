"""
REST API views для системы приёма кандидатов InVisionU.

✅ УЛУЧШЕНИЯ:
- Защита от брутфорса (throttling)
- Валидация поисковых запросов
- Защита GDPR (хеширование email в логах)
- Безопасные переходы статусов
- Избежание race conditions (select_for_update)
"""

import threading
import logging
import hashlib
import secrets

from django.db.models import Avg, Q
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes, throttle_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Candidate, Score, ActionLog, Comment, EmailVerification
from .throttling import LoginRateThrottle, RegisterRateThrottle, ScoringRateThrottle, AdminRateThrottle
from .serializers import (
    CandidateSerializer,
    CandidateListSerializer,
    RegisterSerializer,
    StatusUpdateSerializer,
)
from .scoring import run_scoring
from .emails import send_application_received, send_status_update, send_email_verification
from .validators import validate_search_query, ClaudeValidationError

logger = logging.getLogger(__name__)


class IsStaff(permissions.BasePermission):
    """Проверить, что пользователь is_staff"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


def _tokens(user) -> dict:
    """Создать access и refresh токены"""
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


def _hash_email(email: str) -> str:
    """Хешировать email для логов (GDPR)"""
    return hashlib.sha256(email.encode()).hexdigest()[:8]


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([RegisterRateThrottle])
def register(request):
    """
    Регистрация нового пользователя.
    
    ✅ Throttled: максимум 10 регистраций в день с одного IP
    ✅ Отправляется письмо верификации email
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.save()

    # Создать токен верификации
    token = secrets.token_urlsafe(32)
    EmailVerification.objects.create(user=user, token=token)
    
    # Отправить письмо в отдельном потоке
    threading.Thread(
        target=send_email_verification,
        args=(user, token),
        daemon=True
    ).start()

    logger.info('New user registered: %s', _hash_email(user.email))

    return Response({
        **_tokens(user),
        'email_sent': True,
        'message': 'Регистрация успешна! Проверь почту для подтверждения email.',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    """
    Аутентификация пользователя.
    
    ✅ Throttled: максимум 5 попыток в час с одного IP
    ✅ Логируется хеш email, а не сам email (GDPR)
    """
    email = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email и пароль обязательны.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ✅ Логируем хеш email для безопасности
    email_hash = _hash_email(email)
    logger.info('Login attempt: %s', email_hash)

    user = authenticate(username=email, password=password)
    if not user:
        logger.warning('Failed login attempt: %s', email_hash)
        return Response(
            {'error': 'Неверный email или пароль.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    logger.info('User logged in successfully: %s', email_hash)
    return Response({
        **_tokens(user),
        'is_staff': user.is_staff,
    })


@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def my_profile(request):
    """
    Получить, создать или обновить профиль кандидата.
    
    GET: Получить данные текущего кандидата
    POST: Создать новый профиль
    PATCH: Обновить существующий профиль (частично)
    """
    if request.method == 'GET':
        try:
            candidate = request.user.candidate
        except Candidate.DoesNotExist:
            return Response({'detail': 'Анкета ещё не создана.'}, status=404)
        return Response(CandidateSerializer(candidate).data)

    if request.method == 'POST':
        if hasattr(request.user, 'candidate'):
            return Response(
                {'error': 'Анкета уже создана. Используй PATCH для обновления.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CandidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        candidate = serializer.save(user=request.user)
        logger.info('Candidate profile created: %s', _hash_email(request.user.email))
        return Response(CandidateSerializer(candidate).data, status=status.HTTP_201_CREATED)

    if request.method == 'PATCH':
        try:
            candidate = request.user.candidate
        except Candidate.DoesNotExist:
            return Response({'detail': 'Анкета не найдена.'}, status=404)

        if candidate.status in ('scoring', 'shortlisted', 'rejected'):
            return Response(
                {'error': f'Редактирование недоступно — статус: {candidate.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if candidate.status == 'scored' and candidate.submit_attempts >= 3:
            return Response(
                {'error': 'Исчерпаны все 3 попытки отправки.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CandidateSerializer(candidate, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        logger.info('Candidate profile updated: %d', candidate.id)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([ScoringRateThrottle])
def submit_application(request):
    """
    Отправить заявку на оценку.
    
    ✅ Throttled: максимум 1 отправка в минуту
    ✅ Запускает скоринг в отдельном потоке
    ✅ Отправляет письмо подтверждения
    """
    try:
        candidate = request.user.candidate
    except Candidate.DoesNotExist:
        return Response({'error': 'Сначала создай анкету.'}, status=404)

    MAX_ATTEMPTS = 3

    if candidate.submit_attempts >= MAX_ATTEMPTS:
        return Response(
            {
                'error': f'Исчерпаны все {MAX_ATTEMPTS} попытки отправки заявки.',
                'submit_attempts': candidate.submit_attempts,
                'max_attempts': MAX_ATTEMPTS,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if candidate.status == 'scoring':
        return Response(
            {'error': 'Заявка уже оценивается, подожди немного.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not candidate.is_complete:
        return Response(
            {
                'error': 'Анкета заполнена не полностью.',
                'completion_percent': candidate.completion_percent,
                'required': 80,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ✅ Использовать transaction для атомарности
    with transaction.atomic():
        candidate.submit_attempts += 1
        candidate.status = 'scoring'
        candidate.save(update_fields=['submit_attempts', 'status'])
        
        logger.info(
            'Application submitted by: %s (attempt %d)',
            _hash_email(request.user.email),
            candidate.submit_attempts
        )

    # Запустить скоринг в отдельном потоке
    thread = threading.Thread(target=run_scoring, args=(candidate.id,), daemon=True)
    thread.start()

    # Отправить письмо подтверждения
    threading.Thread(target=send_application_received, args=(candidate,), daemon=True).start()

    attempts_left = MAX_ATTEMPTS - candidate.submit_attempts
    return Response({
        "message": "Заявка принята! Оценка займёт 1–2 минуты.",
        "submit_attempts": candidate.submit_attempts,
        "attempts_left": attempts_left,
        "max_attempts": MAX_ATTEMPTS,
    })


@api_view(['GET'])
@permission_classes([IsStaff])
def dashboard_stats(request):
    """
    Получить статистику дашборда.
    
    Возвращает:
    - Всего кандидатов
    - Включено в шортлист
    - Помечено как AI
    - Средний скор
    - Распределение по баллам
    """
    total = Candidate.objects.count()
    shortlisted = Candidate.objects.filter(status='shortlisted').count()
    ai_flagged = Score.objects.filter(ai_detected=True).count()
    avg_score = Score.objects.aggregate(avg=Avg('total_score'))['avg'] or 0

    # Распределение по скору
    high = Score.objects.filter(total_score__gte=8).count()
    medium = Score.objects.filter(total_score__gte=5, total_score__lt=8).count()
    low = Score.objects.filter(total_score__lt=5).count()

    logger.info('Dashboard stats accessed by: %s', _hash_email(request.user.email))

    return Response({
        'total': total,
        'shortlisted': shortlisted,
        'ai_flagged': ai_flagged,
        'avg_score': round(avg_score, 1),
        'distribution': {
            'high': high,
            'medium': medium,
            'low': low,
        },
    })


@api_view(['GET'])
@permission_classes([IsStaff])
def all_candidates(request):
    """
    Получить список кандидатов с фильтрами и поиском.
    
    Query параметры:
    - status: new, scoring, scored, shortlisted, rejected
    - city: фильтр по городу
    - ai_detected: true/false
    - recommendation: high, medium, low
    - search: поиск по ФИ, городу, школе
    - sort: score_desc, score_asc, date_desc, date_asc, name
    
    ✅ С валидацией поисковых запросов
    ✅ Защита от SQL injection
    """
    qs = Candidate.objects.select_related('score', 'user').all()

    # Фильтр по статусу
    if s := request.query_params.get('status'):
        valid_statuses = dict(Candidate.STATUS_CHOICES).keys()
        if s in valid_statuses:
            qs = qs.filter(status=s)
        else:
            logger.warning('Invalid status filter: %s', s)

    # Фильтр по городу
    if city := request.query_params.get('city'):
        city = validate_search_query(city, max_length=100)
        if city:
            qs = qs.filter(city__icontains=city)

    # Фильтр по AI детекции
    if request.query_params.get('ai_detected') == 'true':
        qs = qs.filter(score__ai_detected=True)

    # Фильтр по рекомендации
    if rec := request.query_params.get('recommendation'):
        if rec in ['high', 'medium', 'low']:
            qs = qs.filter(score__recommendation=rec)

    # Поиск по ФИ, городу, школе
    if search := request.query_params.get('search'):
        search = validate_search_query(search, max_length=100)
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(city__icontains=search) |
                Q(school__icontains=search)
            )
            logger.info('Search query executed: "%s"', search)
        else:
            logger.warning('Search query blocked as unsafe: %s', request.query_params.get('search'))

    # Сортировка
    sort_map = {
        'score_desc': '-score__total_score',
        'score_asc': 'score__total_score',
        'date_desc': '-created_at',
        'date_asc': 'created_at',
        'name': 'first_name',
    }
    sort_key = request.query_params.get('sort', 'score_desc')
    qs = qs.order_by(sort_map.get(sort_key, '-score__total_score'))

    serializer = CandidateListSerializer(qs, many=True)
    logger.info('Candidates list requested by: %s (count: %d)', _hash_email(request.user.email), qs.count())

    return Response({
        'count': qs.count(),
        'results': serializer.data,
    })


@api_view(['GET'])
@permission_classes([IsStaff])
def candidate_detail(request, pk):
    """
    Получить детальную информацию о кандидате.
    
    Args:
        pk: ID кандидата
    """
    try:
        candidate = Candidate.objects.select_related('score', 'user').get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Кандидат не найден.'}, status=404)
    
    logger.info('Candidate detail accessed by: %s (candidate: %d)', _hash_email(request.user.email), pk)
    return Response(CandidateSerializer(candidate).data)


@api_view(['POST'])
@permission_classes([IsStaff])
def update_status(request, pk):
    """
    Изменить статус кандидата.
    
    ✅ С валидацией переходов между статусами
    ✅ С использованием select_for_update для избежания race conditions
    
    Допустимые переходы:
    - new → scoring
    - scoring → scored
    - scored → shortlisted, rejected, scoring (переоценка)
    - shortlisted → (финальный)
    - rejected → (финальный)
    """
    try:
        # ✅ Блокировка для избежания race condition
        candidate = Candidate.objects.select_for_update().get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Кандидат не найден.'}, status=404)

    serializer = StatusUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    old_status = candidate.status
    new_status = serializer.validated_data['status']
    
    # ✅ Валидировать переходы между статусами
    valid_transitions = {
        'new': ['scoring'],
        'scoring': ['scored'],
        'scored': ['shortlisted', 'rejected', 'scoring'],
        'shortlisted': [],
        'rejected': [],
    }
    
    if new_status not in valid_transitions.get(old_status, []):
        logger.warning(
            'Invalid status transition attempted by %s: %s → %s (candidate: %d)',
            _hash_email(request.user.email),
            old_status,
            new_status,
            pk
        )
        return Response(
            {'error': f'Недопустимый переход: {old_status} → {new_status}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    candidate.status = new_status
    candidate.save(update_fields=['status'])

    ActionLog.objects.create(
        candidate=candidate,
        actor=request.user,
        action='status_change',
        details=f'Статус изменён: {old_status} → {new_status}',
    )

    logger.info(
        'Candidate %d status changed by %s: %s → %s',
        pk,
        _hash_email(request.user.email),
        old_status,
        new_status
    )
    return Response({'status': candidate.status, 'id': candidate.id})


@api_view(['POST'])
@permission_classes([IsStaff])
def rescore_candidate(request, pk):
    """
    Запустить переоценку кандидата.
    
    Args:
        pk: ID кандидата
    """
    try:
        candidate = Candidate.objects.get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Кандидат не найден.'}, status=404)

    thread = threading.Thread(target=run_scoring, args=(candidate.id,), daemon=True)
    thread.start()

    ActionLog.objects.create(
        candidate=candidate,
        actor=request.user,
        action='rescore',
        details='Запущена переоценка',
    )

    logger.info('Candidate %d rescored by: %s', pk, _hash_email(request.user.email))
    return Response({'message': f'Переоценка запущена для {candidate.full_name}.'})


@api_view(['GET', 'POST'])
@permission_classes([IsStaff])
def candidate_comments(request, pk):
    """
    Получить или создать комментарий для кандидата.
    
    GET: Список всех комментариев
    POST: Добавить новый комментарий и отправить письмо кандидату
    """
    try:
        candidate = Candidate.objects.get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Кандидат не найден.'}, status=404)

    if request.method == 'GET':
        comments = Comment.objects.filter(candidate=candidate).select_related('author')
        data = [{
            'id': c.id,
            'text': c.text,
            'author': c.author.email,
            'created_at': c.created_at,
        } for c in comments]
        logger.info('Comments requested for candidate %d by: %s', pk, _hash_email(request.user.email))
        return Response(data)

    if request.method == 'POST':
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Текст комментария обязателен.'}, status=400)

        comment = Comment.objects.create(
            candidate=candidate,
            author=request.user,
            text=text,
        )

        # Отправить письмо кандидату в отдельном потоке
        threading.Thread(
            target=send_status_update,
            args=(candidate,),
            kwargs={'comment': text},
            daemon=True,
        ).start()

        logger.info('Comment added to candidate %d by: %s', pk, _hash_email(request.user.email))
        return Response({
            'id': comment.id,
            'text': comment.text,
            'author': comment.author.email,
            'created_at': comment.created_at,
        }, status=201)


@api_view(['GET'])
@permission_classes([IsStaff])
def action_log(request):
    """
    Получить лог действий комиссии.
    
    Показывает последние 50 действий: смены статусов, комментарии, переоценки
    """
    logs = ActionLog.objects.select_related('actor', 'candidate').all()[:50]
    data = [{
        'id': l.id,
        'actor': l.actor.email,
        'action': l.get_action_display(),
        'candidate': l.candidate.full_name,
        'candidate_id': l.candidate.id,
        'details': l.details,
        'created_at': l.created_at,
    } for l in logs]
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    """
    Подтвердить email по токену.
    
    Args:
        token: Токен верификации из письма
    """
    token = request.data.get('token', '').strip()
    if not token:
        return Response({'error': 'Токен обязателен.'}, status=400)

    try:
        ev = EmailVerification.objects.get(token=token)
    except EmailVerification.DoesNotExist:
        logger.warning('Invalid email verification token attempted')
        return Response({'error': 'Неверный или истёкший токен.'}, status=400)

    if ev.is_verified:
        return Response({'message': 'Email уже подтверждён.'})

    ev.is_verified = True
    ev.save()

    logger.info('Email verified: %s', _hash_email(ev.user.email))
    return Response({'message': 'Email успешно подтверждён! Теперь можешь войти.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resend_verification(request):
    """
    Отправить письмо верификации email повторно.
    """
    user = request.user
    ev, _ = EmailVerification.objects.get_or_create(user=user)

    if ev.is_verified:
        return Response({'message': 'Email уже подтверждён.'})

    ev.token = secrets.token_urlsafe(32)
    ev.save()

    threading.Thread(
        target=send_email_verification,
        args=(user, ev.token),
        daemon=True
    ).start()

    logger.info('Verification email resent to: %s', _hash_email(user.email))
    return Response({'message': 'Письмо отправлено повторно.'})
