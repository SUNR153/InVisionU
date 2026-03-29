from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar     = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Профиль'
        verbose_name_plural = 'Профили'

    def __str__(self):
        return f'Profile({self.user.email})'

    @property
    def is_candidate(self):
        return hasattr(self.user, 'candidate')

    @property
    def initials(self):
        name = self.user.get_full_name() or self.user.email
        parts = name.split()
        if len(parts) >= 2:
            return f'{parts[0][0]}{parts[1][0]}'.upper()
        return name[:2].upper()
