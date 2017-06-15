from django.contrib.auth import get_user_model

import pytest
from mixer.backend.django import mixer


User = get_user_model()
pytestmark = pytest.mark.django_db


def test__str__():
    user = User(username='gopar')
    assert user.__str__() == 'gopar'
