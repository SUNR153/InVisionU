from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Candidate, Score


class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = [
            'motivation_score', 'leadership_score', 'authenticity_score',
            'growth_score', 'total_score',
            'ai_detected', 'ai_probability',
            'summary', 'strengths', 'red_flags', 'recommendation',
            'scored_at',
        ]
        read_only_fields = fields


class CandidateSerializer(serializers.ModelSerializer):
    score              = ScoreSerializer(read_only=True)
    full_name          = serializers.ReadOnlyField()
    initials           = serializers.ReadOnlyField()
    completion_percent = serializers.ReadOnlyField()
    is_complete        = serializers.ReadOnlyField()
    email              = serializers.SerializerMethodField()

    class Meta:
        model  = Candidate
        fields = [
            'id',
            'first_name', 'last_name', 'full_name', 'initials',
            'age', 'city', 'school', 'phone', 'email',
            'motivation', 'achievement', 'problem', 'future', 'essay',
            'status', 'completion_percent', 'is_complete',
            'score',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def get_email(self, obj):
        return obj.user.email

    def validate_age(self, value):
        if value < 14 or value > 30:
            raise serializers.ValidationError('Возраст должен быть от 14 до 30 лет.')
        return value

    def validate_first_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError('Имя слишком короткое.')
        return value.strip()

    def validate_last_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError('Фамилия слишком короткая.')
        return value.strip()


class CandidateListSerializer(serializers.ModelSerializer):
    score              = ScoreSerializer(read_only=True)
    full_name          = serializers.ReadOnlyField()
    initials           = serializers.ReadOnlyField()
    completion_percent = serializers.ReadOnlyField()

    class Meta:
        model  = Candidate
        fields = [
            'id', 'full_name', 'initials',
            'age', 'city', 'school',
            'status', 'completion_percent',
            'score',
            'created_at',
        ]


class RegisterSerializer(serializers.Serializer):
    email     = serializers.EmailField()
    password  = serializers.CharField(min_length=8, write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Этот email уже зарегистрирован.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают.'})
        return data

    def create(self, validated_data):
        email = validated_data['email']
        user  = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
        )
        return user

class StatusUpdateSerializer(serializers.Serializer):
    ALLOWED = ['shortlisted', 'rejected', 'scored']
    status = serializers.ChoiceField(choices=ALLOWED)
