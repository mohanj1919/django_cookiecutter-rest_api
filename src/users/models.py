
from datetime import datetime, timedelta, timezone

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.mail import send_mail
from django.db import models
from djchoices import DjangoChoices, ChoiceItem
import pyotp


class CurationUserManager(BaseUserManager,):
    use_in_migrations = True

    def _create_user(self, email, password, is_staff, is_superuser, is_active, first_name, last_name, **extra_fields):
        """
        Creates and saves a User with the given username, email and password.
        """
        now = datetime.now(timezone.utc)

        if not email:
            raise ValueError('The given email must be set')

        email = self.normalize_email(email)
        otp_secret_key = pyotp.random_base32()

        user = self.model(email=email,
                          # we do not use this flag!
                          is_staff=is_staff,
                          is_superuser=is_superuser,
                          is_active=is_active,
                          user_created_on=now,
                          first_name=first_name,
                          last_name=last_name,
                          otp_secret_key=otp_secret_key,
                          **extra_fields)

        user.set_password(password)

        user.save(using=self._db)

        return user

    def create_user(self, email, password, first_name, last_name, **extra_fields):
        return self._create_user(email, password, False, False, False, first_name, last_name, **extra_fields)

    def create_superuser(self, email, password, first_name, last_name, **extra_fields):
        return self._create_user(email, password, True, True, True, first_name, last_name, **extra_fields)

    def get_user_details(self, user_ids):
        return self.filter(id__in=user_ids)

# Custom User objetc to extend Django user authentication
# OM1 admin users will be population via the python shell to allow setting of the superuser flag


class CurationUser(AbstractBaseUser, PermissionsMixin):
    class Meta:
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#db-table
        db_table = 'curation_user'
        # https://docs.djangoproject.com/en/1.10/ref/models/options/#default-permissions
        default_permissions = ()
        # Moved custom permissions to the auth consumer to allow migrations between versions
    id = models.AutoField(primary_key=True)
    # should always be set using the access method! sadly Python does not have a concept  of private
    # variables
    first_name = models.CharField(max_length=100, db_index=True)
    last_name = models.CharField(max_length=50, db_index=True)
    email = models.CharField(max_length=256, unique=True, db_index=True)
    forgot_password_hash = models.CharField(max_length=128, null=True)
    password_expiry_on = models.DateTimeField(auto_now=False, auto_now_add=False, null=True)
    forgot_password_hash_expiry_on = models.DateTimeField(auto_now=False, auto_now_add=False, null=True)
    profile_picture = models.TextField(default='PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSI0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0zIDV2MTRjMCAxLjEuODkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMkg1Yy0xLjExIDAtMiAuOS0yIDJ6bTEyIDRjMCAxLjY2LTEuMzQgMy0zIDNzLTMtMS4zNC0zLTMgMS4zNC0zIDMtMyAzIDEuMzQgMyAzem0tOSA4YzAtMiA0LTMuMSA2LTMuMXM2IDEuMSA2IDMuMXYxSDZ2LTF6Ii8+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')
    is_active = models.BooleanField(default=False, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    # can be null, records when is_deleted was set to true (if)
    deleted_on = models.DateTimeField(auto_now=False, auto_now_add=False, null=True, db_index=True)
    # log who deleted the user
    deleted_by = models.CharField(max_length=256, null=True)

    # field used to track the last email the user has verified (like when the email address gets changed)
    # if null - never verified
    user_created_on = models.DateTimeField(auto_now=False, auto_now_add=True, null=False, db_index=True)
    # <email of admin creating/inviting user>
    user_created_by = models.CharField(max_length=256, null=False)

    otp_secret_key = models.CharField(max_length=100, null = True)
    reset_password_requested_by = models.ForeignKey('self', null=True)
    phone_number = models.CharField(max_length=15, null=True, )

    class MfaType(DjangoChoices):
        sms = ChoiceItem("sms")
        google = ChoiceItem("google")

    mfa_type = models.CharField(max_length=20, choices=MfaType.choices, default=MfaType.google)

    # required by django interface; do not use; defaults to false;
    is_staff = models.BooleanField(default=False, db_index=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', ]
    objects = CurationUserManager()

    # define all checks which would forbid a user logging in, always overwritten is user is a superuser
    # those users should only ever be made via the backend
    def is_allowed_to_login(self):
        # if deleted answer is always no
        if self.is_deleted:
            return False
        # if super user only true if not deleted (the middleware should not allow inactive users either way)
        elif self.is_superuser:
            return True
        else:
            if self.is_active:
                return True
            else:
                return False

    # method to allow flagging a user as deleted
    def delete_user(self, admin_email):
        try:
            self.deleted_by = admin_email
            self.deleted_on = datetime.now(timezone.utc)  # .strftime('%Y-%m-%d %H:%M:%S.%f%z')
            self.is_deleted = True
            self.set_is_active(False)
            self.save()

            return "User successfully deleted."
        except:
            return "User deletion failed."

    # method to allow a view to set the user password
    def update_password(self, new_password):
        try:
            self.set_password(new_password)
            # self.set_is_active(True)
            # set the password expiry
            self.password_expiry_on = datetime.now(timezone.utc) + timedelta(days=settings.PWD_EXPIRY_CYCLE_DAYS)
            # save the changes
            self.save()
            return True
        except:
            return False
