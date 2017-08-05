
from django.contrib.auth import get_user_model

class EmailBackend(object):

    def get_user(self, username=None):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email=username)
            return user
        except UserModel.DoesNotExist:
            return None

    def authenticate(self, username=None, password=None, **kwargs):
        user = self.get_user(username)
        if user is not None and user.check_password(password) and user.is_allowed_to_login():
            return user
        return None
