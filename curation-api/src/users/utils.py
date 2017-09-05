import base64
import pyotp
import uuid
import sendgrid
import logging

from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.template import Context, Template
from datetime import datetime, timedelta
from django.conf import settings
from ..patients.models import EmailTemplate

# Get an instance of a logger
logger = logging.getLogger(__name__)

def get_totp_instance(secretKey, interval=30):
    """
    Returns the Pytotp instance with base32 encoded secret key
    """

    totpInstance = pyotp.TOTP(secretKey,interval=interval)
    return totpInstance


class SendEmailUtil:

    def _get_html_content_for_email(self, email_template, placeholders_data):
        """
        Preparing email content
        """
        options = {
            'name': placeholders_data['recipient_name'],
            'action_url': placeholders_data['action_url'],
            'support_email': placeholders_data['support_email'],
            'login_url':placeholders_data['login_url']
        }
        context = Context(options)
        template = Template(email_template)
        emailContent = template.render(context)
        return emailContent

    def sending_mail(self, user, email_template, subject):
        """
        sending email
        """
        user_name = user.first_name + " " + user.last_name
        action_url = settings.SET_PASSWORD_URL + str(user.forgot_password_hash)
        placeholders_data = {
            'recipient_name': user_name,
            'action_url': action_url,
            'support_email': settings.SUPPORT_EMAIL_ADDRESS,
            'login_url':settings.LOGIN_URL
        }
        from_email = settings.EMAIL_HOST_USER
        html_content = self._get_html_content_for_email(email_template, placeholders_data)
        logging.info("preparing email content")
        data = {
            "personalizations": [
                {
                    "to": [{
                        "email": user.email
                    }],
                    "subject": subject
                }
            ],
            "from": {
                "email": from_email
            },
            "content": [
                {
                    "type": "text/html",
                    "value": html_content
                }
            ]
        }
        try:
            sg = sendgrid.SendGridAPIClient(apikey=settings.SENDGRID_API_KEY)
            response = sg.client.mail.send.post(request_body=data)
            return response
        except:
            return None

    def generate_reset_password_link(self, user, template_name):
        """
        Generate reset password link to send to the user
        """
        email_template = EmailTemplate.objects.get_template_by_name(template_name)
        expiry_datetime = datetime.now() + timedelta(hours=24)  # timedelta(days=1)
        user.forgot_password_hash = uuid.uuid1()
        user.forgot_password_hash_expiry_on = expiry_datetime
        user.save()

        self.sending_mail(user, email_template.template, email_template.subject)
        return
