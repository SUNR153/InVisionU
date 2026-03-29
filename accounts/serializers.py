from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


class RegisterSerializer(serializers.Serializer):
    email     = serializers.EmailField()
    password  = serializers.CharField(min_length=8, write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Этот email уже зарегистрирован.')
        return value

    def validate_password(self, value):
        validate_password(value)
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
        UserProfile.objects.get_or_create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.lower().strip()


class UserSerializer(serializers.ModelSerializer):
    is_candidate = serializers.SerializerMethodField()
    initials     = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'email', 'is_staff', 'is_candidate', 'initials', 'date_joined']

    def get_is_candidate(self, obj):
        return hasattr(obj, 'candidate')

    def get_initials(self, obj):
        try:
            return obj.profile.initials
        except Exception:
            return obj.email[:2].upper()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({'new_password2': 'Пароли не совпадают.'})
        return data
