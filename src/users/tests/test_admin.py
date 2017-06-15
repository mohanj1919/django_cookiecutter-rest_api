from django.contrib.auth import get_user_model

import pytest
from mixer.backend.django import mixer

from ..admin import MyUserCreationForm

pytestmark = pytest.mark.django_db
User = get_user_model()


def test_clean_username_success():
    # Instantiate the form with a new username
    form = MyUserCreationForm({
        'username': 'alamode',
        'password1': '123456',
        'password2': '123456',
    })
    # Run is_valid() to trigger the validation
    valid = form.is_valid()
    assert valid


def test_clean_username_false():
    # Instantiate the form with the same username as self.user
    mixer.blend('users.User', username='gopar')
    form = MyUserCreationForm({
        'username': 'gopar',
        'password1': '123456',
        'password2': '123456',
    })
    # Run is_valid() to trigger the validation, which is going to fail
    # because the username is already taken
    valid = form.is_valid()

    assert not valid
