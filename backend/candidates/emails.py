from mailersend import EmailBuilder, MailerSendClient
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def _send(subject, message, recipient):
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
        logger.info(f"EMAIL SENT: {subject} → {recipient}")
    except Exception as e:
        logger.error(f"EMAIL ERROR: {subject} → {recipient} | {e}")