import threading
import logging

from django.db.models import Avg, Q
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes, throttle_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Candidate, Score
from .throttling import LoginRateThrottle, RegisterRateThrottle, ScoringRateThrottle, AdminRateThrottle
from .serializers import (
    CandidateSerializer,
    CandidateListSerializer,
    RegisterSerializer,
    StatusUpdateSerializer,
)
from .scoring import run_scoring

logger = logging.getLogger(__name__)


class IsStaff(permissions.BasePermission):
    """Только Django staff (приёмная комиссия)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


def _tokens(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([RegisterRateThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()

    import secrets
    from candidates.models import EmailVerification
    from candidates.emails import send_email_verification
    token = secrets.token_urlsafe(32)
    EmailVerification.objects.create(user=user, token=token)
    threading.Thread(
        target=send_email_verification,
        args=(user, token),
        daemon=True
    ).start()

    return Response({
        **_tokens(user),
        'email_sent': True,
        'message': 'Регистрация успешна! Проверь почту для подтверждения email.',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    email    = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email и пароль обязательны.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=email, password=password)
    if not user:
        return Response(
            {'error': 'Неверный email или пароль.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response({
        **_tokens(user),
        'is_staff': user.is_staff,
    })


@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def my_profile(request):
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
        return Response(CandidateSerializer(candidate).data, status=status.HTTP_201_CREATED)

    if request.method == 'PATCH':
        try:
            candidate = request.user.candidate
        except Candidate.DoesNotExist:
            return Response({'detail': 'Анкета не найдена.'}, status=404)

        if candidate.status in ('scoring', 'scored', 'shortlisted', 'rejected'):
            return Response(
                {'error': f'Редактирование недоступно — статус: {candidate.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CandidateSerializer(candidate, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([ScoringRateThrottle])
def submit_application(request):
    try:
        candidate = request.user.candidate
    except Candidate.DoesNotExist:
        return Response({'error': 'Сначала создай анкету.'}, status=404)

    if candidate.status in ('scoring', 'scored', 'shortlisted', 'rejected'):
        return Response(
            {'error': f'Заявка уже отправлена (статус: {candidate.status})'},
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

    thread = threading.Thread(target=run_scoring, args=(candidate.id,), daemon=True)
    thread.start()

    from candidates.emails import send_application_received
    threading.Thread(target=send_application_received, args=(candidate,), daemon=True).start()
    return Response({"message": "Заявка принята! Оценка займёт 1–2 минуты."})


@api_view(['GET'])
@permission_classes([IsStaff])
def dashboard_stats(request):
    total       = Candidate.objects.count()
    shortlisted = Candidate.objects.filter(status='shortlisted').count()
    ai_flagged  = Score.objects.filter(ai_detected=True).count()
    avg_score   = Score.objects.aggregate(avg=Avg('total_score'))['avg'] or 0

    high   = Score.objects.filter(total_score__gte=8).count()
    medium = Score.objects.filter(total_score__gte=5, total_score__lt=8).count()
    low    = Score.objects.filter(total_score__lt=5).count()

    return Response({
        'total':       total,
        'shortlisted': shortlisted,
        'ai_flagged':  ai_flagged,
        'avg_score':   round(avg_score, 1),
        'distribution': {
            'high':   high,
            'medium': medium,
            'low':    low,
        },
    })


@api_view(['GET'])
@permission_classes([IsStaff])
def all_candidates(request):
    qs = Candidate.objects.select_related('score', 'user').all()

    if s := request.query_params.get('status'):
        qs = qs.filter(status=s)

    if city := request.query_params.get('city'):
        qs = qs.filter(city__icontains=city)

    if request.query_params.get('ai_detected') == 'true':
        qs = qs.filter(score__ai_detected=True)

    if rec := request.query_params.get('recommendation'):
        qs = qs.filter(score__recommendation=rec)

    if search := request.query_params.get('search'):
        qs = qs.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)  |
            Q(city__icontains=search)       |
            Q(school__icontains=search)
        )

    sort_map = {
        'score_desc':  '-score__total_score',
        'score_asc':   'score__total_score',
        'date_desc':   '-created_at',
        'date_asc':    'created_at',
        'name':        'first_name',
    }
    sort_key = request.query_params.get('sort', 'score_desc')
    qs = qs.order_by(sort_map.get(sort_key, '-score__total_score'))

    serializer = CandidateListSerializer(qs, many=True)
    return Response({
        'count':   qs.count(),
        'results': serializer.data,
    })


@api_view(['GET'])
@permission_classes([IsStaff])
def candidate_detail(request, pk):
    try:
        candidate = Candidate.objects.select_related('score', 'user').get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Кандидат не найден.'}, status=404)
    return Response(CandidateSerializer(candidate).data)


@api_view(['POST'])
@permission_classes([IsStaff])
def update_status(request, pk):
    try:
        candidate = Candidate.objects.get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Кандидат не найден.'}, status=404)

    serializer = StatusUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    candidate.status = serializer.validated_data['status']
    candidate.save(update_fields=['status'])

    from candidates.models import ActionLog
    ActionLog.objects.create(
        candidate=candidate,
        actor=request.user,
        action='status_change',
        details=f'Статус изменён на: {candidate.status}',
    )

    return Response({'status': candidate.status, 'id': candidate.id})


@api_view(['POST'])
@permission_classes([IsStaff])
def rescore_candidate(request, pk):
    try:
        candidate = Candidate.objects.get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Кандидат не найден.'}, status=404)

    thread = threading.Thread(target=run_scoring, args=(candidate.id,), daemon=True)
    thread.start()

    from candidates.models import ActionLog
    ActionLog.objects.create(
        candidate=candidate,
        actor=request.user,
        action='rescore',
        details='Запущена переоценка',
    )

    return Response({'message': f'Переоценка запущена для {candidate.full_name}.'})


@api_view(['GET', 'POST'])
@permission_classes([IsStaff])
def candidate_comments(request, pk):
    try:
        candidate = Candidate.objects.get(pk=pk)
    except Candidate.DoesNotExist:
        return Response({'error': 'Не найден.'}, status=404)

    if request.method == 'GET':
        from candidates.models import Comment
        comments = Comment.objects.filter(candidate=candidate).select_related('author')
        data = [{
            'id':         c.id,
            'text':       c.text,
            'author':     c.author.email,
            'created_at': c.created_at,
        } for c in comments]
        return Response(data)

    if request.method == 'POST':
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Текст комментария обязателен.'}, status=400)

        from candidates.models import Comment
        comment = Comment.objects.create(
            candidate=candidate,
            author=request.user,
            text=text,
        )

        from candidates.emails import send_status_update
        import threading
        thread = threading.Thread(
            target=send_status_update,
            args=(candidate,),
            kwargs={'comment': text},
            daemon=True,
        )
        thread.start()

        return Response({
            'id':         comment.id,
            'text':       comment.text,
            'author':     comment.author.email,
            'created_at': comment.created_at,
        }, status=201)


@api_view(['GET'])
@permission_classes([IsStaff])
def action_log(request):
    from candidates.models import ActionLog
    logs = ActionLog.objects.select_related('actor', 'candidate').all()[:50]
    data = [{
        'id':            l.id,
        'actor':         l.actor.email,
        'action':        l.get_action_display(),
        'candidate':     l.candidate.full_name,
        'candidate_id':  l.candidate.id,
        'details':       l.details,
        'created_at':    l.created_at,
    } for l in logs]
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    import secrets
    token = request.data.get('token', '').strip()
    if not token:
        return Response({'error': 'Токен обязателен.'}, status=400)

    from candidates.models import EmailVerification
    try:
        ev = EmailVerification.objects.get(token=token)
    except EmailVerification.DoesNotExist:
        return Response({'error': 'Неверный или истёкший токен.'}, status=400)

    if ev.is_verified:
        return Response({'message': 'Email уже подтверждён.'})

    ev.is_verified = True
    ev.save()

    return Response({'message': 'Email успешно подтверждён! Теперь можешь войти.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resend_verification(request):
    import secrets
    from candidates.models import EmailVerification
    from candidates.emails import send_email_verification

    user = request.user
    ev, _ = EmailVerification.objects.get_or_create(user=user)

    if ev.is_verified:
        return Response({'message': 'Email уже подтверждён.'})

    ev.token = secrets.token_urlsafe(32)
    ev.save()

    import threading
    threading.Thread(
        target=send_email_verification,
        args=(user, ev.token),
        daemon=True
    ).start()

    return Response({'message': 'Письмо отправлено повторно.'})