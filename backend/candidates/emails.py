"""
Email уведомления для кандидатов.
✅ Защита GDPR: хеширование email в логах
"""

import hashlib
import logging
from typing import Dict, Optional

from mailersend import EmailBuilder, MailerSendClient
from django.conf import settings

logger = logging.getLogger(__name__)


def _hash_email(email: str) -> str:
    """Хешировать email для логов (GDPR)"""
    return hashlib.sha256(email.encode()).hexdigest()[:8]


def _send(subject: str, message: str, recipient: str) -> None:
    """
    Отправить письмо через MailerSend.
    
    ✅ Email НЕ логируется, только хеш
    
    Args:
        subject: Тема письма
        message: Текст письма
        recipient: Email получателя
    """
    try:
        client = MailerSendClient(api_key=settings.MAILERSEND_API_KEY)
        email = (
            EmailBuilder()
            .set_from(settings.MAILERSEND_FROM_EMAIL, "inVisionU")
            .add_to(recipient)
            .set_subject(subject)
            .set_text(message)
            .build()
        )
        client.emails.send(email)
        
        # ✅ Логируем хеш, а не сам email
        email_hash = _hash_email(recipient)
        logger.info(f"EMAIL SENT: {subject} → hash:{email_hash}")
        
    except Exception as e:
        email_hash = _hash_email(recipient)
        logger.error(f"EMAIL ERROR: {subject} → hash:{email_hash} | {type(e).__name__}: {e}")


def send_registration_confirmation(user) -> None:
    """Отправить письмо подтверждения регистрации"""
    _send(
        subject='Добро пожаловать в inVision U!',
        message=f'''Привет!

Ты успешно зарегистрировался в системе приёма заявок inVision University.

Теперь заполни анкету на нашем сайте.

Дедлайн: 15 апреля 2026

Успехов! 🚀
Команда inVision U
''',
        recipient=user.email,
    )


def send_application_received(candidate) -> None:
    """Отправить письмо о получении заявки"""
    _send(
        subject='Заявка принята — inVision U',
        message=f'''Привет, {candidate.first_name}!

Твоя заявка в inVision University успешно получена и отправлена на оценку.

Мы уведомим тебя о результатах в ближайшие 2 часа.

С уважением,
Команда inVision U
''',
        recipient=candidate.user.email,
    )


def send_status_update(candidate, comment: Optional[str] = None) -> None:
    """
    Отправить письмо об обновлении статуса.
    
    Args:
        candidate: Объект Candidate
        comment: Опциональный комментарий от комиссии
    """
    status_messages = {
        'shortlisted': '🎉 Поздравляем! Твоя заявка включена в шортлист!',
        'rejected':    '❌ К сожалению, твоя заявка не прошла на этот раз.',
        'scored':      '✅ Твоя заявка рассмотрена приёмной комиссией.',
    }
    
    subject_lines = {
        'shortlisted': '🎉 Ты в шортлисте — inVision U',
        'rejected':    'Результат рассмотрения заявки — inVision U',
        'scored':      'Заявка рассмотрена — inVision U',
    }
    
    status_message = status_messages.get(candidate.status, 'Статус изменён.')
    subject = subject_lines.get(candidate.status, 'Обновление заявки — inVision U')
    
    comment_text = f'\nКомментарий от комиссии:\n"{comment}"\n' if comment else ''
    
    message = f'''Привет, {candidate.first_name}!

{status_message}

{comment_text}

Войди в личный кабинет чтобы увидеть подробности.

С уважением,
Команда inVision U
'''
    
    _send(
        subject=subject,
        message=message,
        recipient=candidate.user.email,
    )


def send_email_verification(user, token: str, frontend_url: str = 'https://in-vision-u-livid.vercel.app') -> None:
    """
    Отправить письмо для верификации email.
    
    Args:
        user: Объект User
        token: Токен верификации
        frontend_url: URL фронтенда
    """
    verify_url = f'{frontend_url}/verify-email?token={token}'
    
    message = f'''Привет!

Для завершения регистрации подтверди свой email:

{verify_url}

Ссылка действительна 24 часа.

С уважением,
Команда inVision U
'''
    
    _send(
        subject='Подтверди свой email — inVision U',
        message=message,
        recipient=user.email,
    )
