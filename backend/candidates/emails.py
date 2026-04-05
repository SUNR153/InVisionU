from mailersend import emails
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def _send(subject, message, recipient):
    try:
        mailer = emails.NewEmail(settings.MAILERSEND_API_KEY)
        mail_body = {}
        mail_from = {
            "name": "inVisionU",
            "email": settings.MAILERSEND_FROM_EMAIL,
        }
        recipients = [{"email": recipient}]
        mailer.set_mail_from(mail_from, mail_body)
        mailer.set_mail_to(recipients, mail_body)
        mailer.set_subject(subject, mail_body)
        mailer.set_plaintext_content(message, mail_body)
        mailer.send(mail_body)
        logger.info(f"EMAIL SENT: {subject} → {recipient}")
    except Exception as e:
        logger.error(f"EMAIL ERROR: {subject} → {recipient} | {e}")