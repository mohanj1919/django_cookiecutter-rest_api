from django.test import TestCase
from ..models import CurationUser


class AuthenticationTests(TestCase):
    def test_login(self):
        admin = CurationUser.objects.get(email='mohan.jagabatthula@ggktech.com')
        self.assertTrue(admin is not None)
