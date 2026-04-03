"""
emails.py — все письма которые отправляет система.
"""
from django.core.mail import send_mail
from django.conf import settings


def send_registration_confirmation(user):
    """Письмо после регистрации."""
    send_mail(
        subject='Добро пожаловать в inVision U!',
        message=f'''Привет!

Ты успешно зарегистрировался в системе приёма заявок inVision University.

Теперь заполни анкету и отправь заявку до 5 апреля 2025.

Удачи!
Команда inVision U
''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_application_received(candidate):
    """Письмо когда кандидат отправил заявку."""
    send_mail(
        subject='Заявка принята — inVision U',
        message=f'''Привет, {candidate.first_name}!

Твоя заявка в inVision University успешно получена и отправлена на оценку.

Мы уведомим тебя о результате в течение 2 недель.

С уважением,
Приёмная комиссия inVision U
''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[candidate.user.email],
        fail_silently=True,
    )


def send_status_update(candidate, comment=None):
    """Письмо когда комиссия изменила статус."""
    status_labels = {
        'shortlisted': 'Поздравляем! Твоя заявка включена в шортлист 🎉',
        'rejected':    'К сожалению, твоя заявка не прошла на этот раз.',
        'scored':      'Твоя заявка рассмотрена приёмной комиссией.',
    }

    subject_labels = {
        'shortlisted': '🎉 Ты в шортлисте — inVision U',
        'rejected':    'Результат рассмотрения заявки — inVision U',
        'scored':      'Заявка рассмотрена — inVision U',
    }

    status_text = status_labels.get(candidate.status, 'Статус твоей заявки изменён.')
    subject     = subject_labels.get(candidate.status, 'Обновление заявки — inVision U')

    comment_text = ''
    if comment:
        comment_text = f'\nКомментарий от комиссии:\n"{comment}"\n'

    send_mail(
        subject=subject,
        message=f'''Привет, {candidate.first_name}!

{status_text}
{comment_text}
Войди в личный кабинет чтобы узнать подробности.

С уважением,
Приёмная комиссия inVision U
''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[candidate.user.email],
        fail_silently=True,
    )