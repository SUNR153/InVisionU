import resend
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


def _send(subject, message, recipient):
    try:
        resend.Emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [recipient],
            "subject": subject,
            "text": message,
        })
        logger.info(f"EMAIL SENT: {subject} → {recipient}")
    except Exception as e:
        logger.error(f"EMAIL ERROR: {subject} → {recipient} | {e}")


def send_registration_confirmation(user):
    _send(
        subject='Добро пожаловать в inVision U!',
        message=f'Привет!\n\nТы успешно зарегистрировался в системе приёма заявок inVision University.\n\nТеперь заполни анкету и отправь заявку до 5 апреля 2025.\n\nУдачи!\nКоманда inVision U',
        recipient=user.email,
    )


def send_application_received(candidate):
    _send(
        subject='Заявка принята — inVision U',
        message=f'Привет, {candidate.first_name}!\n\nТвоя заявка в inVision University успешно получена и отправлена на оценку.\n\nМы уведомим тебя о результате в течение 2 недель.\n\nС уважением,\nПриёмная комиссия inVision U',
        recipient=candidate.user.email,
    )


def send_status_update(candidate, comment=None):
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
    comment_text = f'\nКомментарий от комиссии:\n"{comment}"\n' if comment else ''
    _send(
        subject=subject_labels.get(candidate.status, 'Обновление заявки — inVision U'),
        message=f'Привет, {candidate.first_name}!\n\n{status_labels.get(candidate.status, "Статус изменён.")}\n{comment_text}\nВойди в личный кабинет чтобы узнать подробности.\n\nС уважением,\nПриёмная комиссия inVision U',
        recipient=candidate.user.email,
    )


def send_email_verification(user, token, frontend_url='https://in-vision-u-livid.vercel.app'):
    verify_url = f'{frontend_url}/verify-email?token={token}'
    _send(
        subject='Подтверди свой email — inVision U',
        message=f'Привет!\n\nДля завершения регистрации подтверди свой email:\n\n{verify_url}\n\nСсылка действительна 24 часа.\n\nКоманда inVision U',
        recipient=user.email,
    )