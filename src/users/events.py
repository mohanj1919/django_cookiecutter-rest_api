from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def send_email(sender, instance=None, created=False, **kwargs):
    """
    Actions to be performed after a user is created
    """
    # TODO: generate forgot password link for sending it to the user
    if created:
        user = sender
