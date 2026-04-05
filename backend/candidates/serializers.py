"""
Serializers для моделей Candidate и Score.

✅ УЛУЧШЕНИЯ:
- Type hints
- Улучшенная валидация
- Методы clean
"""

from typing import Dict, Any
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Candidate, Score


class ScoreSerializer(serializers.ModelSerializer):
    """Сериализатор для Score"""
    
    class Meta:
        model = Score
        fields = [
            'motivation_score',
            'leadership_score',
            'authenticity_score',
            'growth_score',
            'total_score',
            'ai_detected',
            'ai_probability',
            'summary',
            'strengths',
            'red_flags',
            'recommendation',
            'scored_at',
        ]
        read_only_fields = fields


class CandidateSerializer(serializers.ModelSerializer):
    """Полный сериализатор для Candidate"""
    
    score = ScoreSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    initials = serializers.ReadOnlyField()
    completion_percent = serializers.ReadOnlyField()
    is_complete = serializers.ReadOnlyField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'initials',
            'age',
            'city',
            'school',
            'phone',
            'email',
            'motivation',
            'achievement',
            'problem',
            'future',
            'essay',
            'status',
            'completion_percent',
            'is_complete',
            'submit_attempts',
            'score',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'status',
            'submit_attempts',
            'created_at',
            'updated_at',
            'full_name',
            'initials',
            'completion_percent',
            'is_complete',
        ]

    def get_email(self, obj: Candidate) -> str:
        """Получить email пользователя"""
        return obj.user.email

    def validate_age(self, value: int) -> int:
        """Валидировать возраст (14-30 лет)"""
        if value < 14 or value > 30:
            raise serializers.ValidationError('Возраст должен быть от 14 до 30 лет.')
        return value

    def validate_first_name(self, value: str) -> str:
        """Валидировать имя"""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Имя слишком короткое (минимум 2 символа).')
        if len(value) > 100:
            raise serializers.ValidationError('Имя слишком длинное (максимум 100 символов).')
        return value

    def validate_last_name(self, value: str) -> str:
        """Валидировать фамилию"""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Фамилия слишком короткая (минимум 2 символа).')
        if len(value) > 100:
            raise serializers.ValidationError('Фамилия слишком длинная (максимум 100 символов).')
        return value

    def validate_school(self, value: str) -> str:
        """Валидировать название школы"""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Название школы слишком короткое.')
        if len(value) > 200:
            raise serializers.ValidationError('Название школы слишком длинное.')
        return value

    def validate_city(self, value: str) -> str:
        """Валидировать город"""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Название города слишком короткое.')
        if len(value) > 100:
            raise serializers.ValidationError('Название города слишком длинное.')
        return value

    def validate_motivation(self, value: str) -> str:
        """Валидировать мотивацию"""
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError('Мотивация должна содержать минимум 10 символов.')
        if len(value) > 2000:
            raise serializers.ValidationError('Мотивация слишком длинная (максимум 2000 символов).')
        return value.strip() if value else ""

    def validate_achievement(self, value: str) -> str:
        """Валидировать достижение"""
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError('Достижение должно содержать минимум 10 символов.')
        if len(value) > 2000:
            raise serializers.ValidationError('Достижение слишком длинное (максимум 2000 символов).')
        return value.strip() if value else ""

    def validate_problem(self, value: str) -> str:
        """Валидировать описание проблемы"""
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError('Описание проблемы должно содержать минимум 10 символов.')
        if len(value) > 2000:
            raise serializers.ValidationError('Описание проблемы слишком длинное (максимум 2000 символов).')
        return value.strip() if value else ""

    def validate_future(self, value: str) -> str:
        """Валидировать планы на 5 лет"""
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError('Планы должны содержать минимум 10 символов.')
        if len(value) > 2000:
            raise serializers.ValidationError('Планы слишком длинные (максимум 2000 символов).')
        return value.strip() if value else ""

    def validate_essay(self, value: str) -> str:
        """Валидировать эссе"""
        if value and len(value.strip()) < 50:
            raise serializers.ValidationError('Эссе слишком короткое (минимум 50 символов).')
        if len(value) > 5000:
            raise serializers.ValidationError('Эссе слишком длинное (максимум 5000 символов).')
        return value.strip() if value else ""


class CandidateListSerializer(serializers.ModelSerializer):
    """Краткий сериализатор для списка кандидатов"""
    
    score = ScoreSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    initials = serializers.ReadOnlyField()
    completion_percent = serializers.ReadOnlyField()

    class Meta:
        model = Candidate
        fields = [
            'id',
            'full_name',
            'initials',
            'age',
            'city',
            'school',
            'status',
            'completion_percent',
            'score',
            'created_at',
        ]


class RegisterSerializer(serializers.Serializer):
    """Сериализатор для регистрации"""
    
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_email(self, value: str) -> str:
        """Валидировать email"""
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Этот email уже зарегистрирован.')
        return value

    def validate_password(self, value: str) -> str:
        """Валидировать пароль"""
        if len(value) < 8:
            raise serializers.ValidationError('Пароль должен содержать минимум 8 символов.')
        if len(value) > 128:
            raise serializers.ValidationError('Пароль слишком длинный.')
        # Проверить, что пароль не слишком простой
        if value.isdigit():
            raise serializers.ValidationError('Пароль не может состоять только из цифр.')
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Валидировать совпадение паролей"""
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают.'})
        return data

    def create(self, validated_data: Dict[str, Any]) -> User:
        """Создать нового пользователя"""
        email = validated_data['email']
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Сериализатор для логина"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value: str) -> str:
        """Валидировать email"""
        return value.lower().strip()


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для User модели"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id', 'is_staff']


class ChangePasswordSerializer(serializers.Serializer):
    """Сериализатор для изменения пароля"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate_new_password(self, value: str) -> str:
        """Валидировать новый пароль"""
        if len(value) < 8:
            raise serializers.ValidationError('Пароль должен содержать минимум 8 символов.')
        if len(value) > 128:
            raise serializers.ValidationError('Пароль слишком длинный.')
        return value

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Валидировать совпадение новых паролей"""
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({
                'new_password2': 'Пароли не совпадают.'
            })
        return data


class StatusUpdateSerializer(serializers.Serializer):
    """Сериализатор для обновления статуса"""
    
    ALLOWED_STATUSES = ['shortlisted', 'rejected', 'scored']
    status = serializers.ChoiceField(choices=ALLOWED_STATUSES)
