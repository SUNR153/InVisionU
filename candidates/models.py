from django.db import models
from django.contrib.auth.models import User


class Candidate(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('scoring', 'Оценивается'),
        ('scored', 'Оценён'),
        ('shortlisted', 'Шортлист'),
        ('rejected', 'Отклонён'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate')

    first_name = models.CharField(max_length=100, verbose_name='Имя')
    last_name = models.CharField(max_length=100, verbose_name='Фамилия')
    age = models.PositiveIntegerField(verbose_name='Возраст')
    city = models.CharField(max_length=100, verbose_name='Город')
    school = models.CharField(max_length=200, verbose_name='Школа/колледж')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')

    motivation = models.TextField(blank=True, verbose_name='Почему inVision U?')
    achievement = models.TextField(blank=True, verbose_name='Главное достижение')
    problem = models.TextField(blank=True, verbose_name='Проблема которую хочешь решить')
    future = models.TextField(blank=True, verbose_name='Планы на 5 лет')
    essay = models.TextField(blank=True, verbose_name='Эссе')
    essay_file = models.FileField(
        upload_to='essays/', blank=True, null=True, verbose_name='Файл эссе'
    )

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата подачи')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Кандидат'
        verbose_name_plural = 'Кандидаты'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def initials(self):
        return f"{self.first_name[:1]}{self.last_name[:1]}".upper()

    @property
    def completion_percent(self):
        fields = [self.motivation, self.achievement, self.problem, self.future, self.essay]
        filled = sum(1 for f in fields if f and f.strip())
        return int((filled / len(fields)) * 100)

    @property
    def is_complete(self):
        return self.completion_percent >= 80


class Score(models.Model):
    candidate = models.OneToOneField(
        Candidate, on_delete=models.CASCADE, related_name='score'
    )

    motivation_score   = models.FloatField(default=0, verbose_name='Мотивация')
    leadership_score   = models.FloatField(default=0, verbose_name='Лидерство')
    authenticity_score = models.FloatField(default=0, verbose_name='Аутентичность')
    growth_score       = models.FloatField(default=0, verbose_name='Рост')
    total_score        = models.FloatField(default=0, verbose_name='Итого')

    ai_detected    = models.BooleanField(default=False, verbose_name='AI обнаружен')
    ai_probability = models.FloatField(default=0, verbose_name='Вероятность AI (0-1)')

    summary        = models.TextField(blank=True, verbose_name='Резюме')
    strengths      = models.JSONField(default=list, verbose_name='Сильные стороны')
    red_flags      = models.JSONField(default=list, verbose_name='Красные флаги')
    recommendation = models.CharField(
        max_length=20, blank=True, verbose_name='Рекомендация'
    )

    raw_response = models.JSONField(default=dict, verbose_name='Сырой ответ Claude')
    scored_at    = models.DateTimeField(auto_now_add=True, verbose_name='Дата оценки')

    class Meta:
        verbose_name = 'Оценка'
        verbose_name_plural = 'Оценки'

    def __str__(self):
        return f"Score({self.candidate.full_name}) = {self.total_score}"
