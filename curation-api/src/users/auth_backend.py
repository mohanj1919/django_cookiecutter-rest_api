
from django.contrib.auth import get_user_model

class EmailBackend(object):

    def get_user(self, username=None):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email__iexact=username.lower())
            return user
        except UserModel.DoesNotExist as er:
            raise er

    def authenticate(self, username=None, password=None, **kwargs):
        user = kwargs.get('user')
        _user = self.get_user(username) if user is None else user
        if _user is not None and _user.check_password(password) and _user.is_allowed_to_login():
            return _user
        return None
