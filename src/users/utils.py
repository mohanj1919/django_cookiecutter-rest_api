import base64
import pyotp
import uuid

from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.template import Context
from datetime import datetime, timedelta
from django.conf import settings


def get_totp_instance(secretKey,interval=30):
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
        commContext = Context(options)

        emailContent = render_to_string('email_templates/' + email_template, commContext)
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
        to = user.email
        html_content = self._get_html_content_for_email(email_template, placeholders_data)
        text_content = html_content
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return Response({
            "status": status.HTTP_200_OK
        })

    def generate_reset_password_link(self, user, email_template, subject):
        """
        Generate reset password link to send to the user
        """
        expiry_datetime = datetime.now() + timedelta(hours=24)  # timedelta(days=1)
        user.forgot_password_hash = uuid.uuid1()
        user.forgot_password_hash_expiry_on = expiry_datetime
        user.save()
        self.sending_mail(user, email_template, subject)
