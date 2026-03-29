from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model      = UserProfile
    extra      = 0
    can_delete = False
    readonly_fields = ['created_at']


class UserAdmin(BaseUserAdmin):
    inlines       = [UserProfileInline]
    list_display  = ['email', 'is_staff', 'is_active', 'date_joined']
    list_filter   = ['is_staff', 'is_active']
    search_fields = ['email', 'username']
    ordering      = ['-date_joined']


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
