from mailersend import Email
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def _send(subject, message, recipient):
    try:
        mailer = Email(api_key=settings.MAILERSEND_API_KEY)
        mailer.set_mail_from({"email": settings.MAILERSEND_FROM_EMAIL, "name": "inVisionU"})
        mailer.set_mail_to([{"email": recipient}])
        mailer.set_subject(subject)
        mailer.set_plaintext_content(message)
        mailer.send()
        logger.info(f"EMAIL SENT: {subject} → {recipient}")
    except Exception as e:
        logger.error(f"EMAIL ERROR: {subject} → {recipient} | {e}")