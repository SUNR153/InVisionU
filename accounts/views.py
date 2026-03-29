import logging
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)

logger = logging.getLogger(__name__)


def _make_tokens(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'access':   str(refresh.access_token),
        'refresh':  str(refresh),
        'is_staff': user.is_staff,
    }


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    logger.info('New user registered: %s', user.email)

    return Response(_make_tokens(user), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email    = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = authenticate(request, username=email, password=password)
    if not user:
        return Response(
            {'error': 'Неверный email или пароль.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {'error': 'Аккаунт деактивирован. Обратитесь в поддержку.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    logger.info('User logged in: %s', user.email)
    return Response(_make_tokens(user))


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'error': 'Передай refresh токен.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        pass

    return Response({'message': 'Вышел успешно.'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    user = request.user
    data = UserSerializer(user).data

    if hasattr(user, 'candidate'):
        c = user.candidate
        data['candidate'] = {
            'id':                 c.id,
            'status':             c.status,
            'completion_percent': c.completion_percent,
            'is_complete':        c.is_complete,
        }
    else:
        data['candidate'] = None

    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user

    if not user.check_password(serializer.validated_data['old_password']):
        return Response(
            {'old_password': 'Неверный текущий пароль.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(serializer.validated_data['new_password'])
    user.save()

    logger.info('Password changed for user: %s', user.email)
    return Response({'message': 'Пароль успешно изменён.'})
