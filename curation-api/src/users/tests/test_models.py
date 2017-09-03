from django.test import TestCase
from ..models import CurationUser


class CurationUserTest(TestCase):
    """ Test module for CurationUser model """

    def setUp(self):
        CurationUser.objects.create_user(
            id=1,
            email="user1@curation.com",
            password="test",
            first_name="user1",
            last_name="curation")

        CurationUser.objects.create_superuser(
            id=2,
            email="superuser@curation.com",
            password="test",
            first_name="super",
            last_name="user")

    def test_create_user(self):
        user = CurationUser.objects.get(email="user1@curation.com")
        self.assertEqual(
            user.email, "user1@curation.com")

    def test_create_superuser(self):
        user = CurationUser.objects.get(email="superuser@curation.com")
        self.assertEqual(
            user.email, "superuser@curation.com")
        self.assertEqual(
            user.is_superuser, True)

    def test_is_user_allowed_to_login(self):
        user = CurationUser.objects.get(email="user1@curation.com")
        self.assertFalse(user.is_allowed_to_login())

    def test_is_superuser_allowed_to_login(self):
        user = CurationUser.objects.get(email="superuser@curation.com")
        self.assertTrue(user.is_allowed_to_login())

    def test_is_activeuser_allowed_to_login(self):
        user = CurationUser.objects.get(email="user1@curation.com")
        user.is_active = True
        user.save()
        self.assertTrue(user.is_allowed_to_login())

    def test_is_deleted_user_allowed_to_login(self):
        user = CurationUser.objects.get(email="user1@curation.com")
        super_user = CurationUser.objects.get(email="superuser@curation.com")
        super_user.delete_user("admin")
        user.delete_user("admin")
        self.assertFalse(user.is_allowed_to_login())
        self.assertFalse(super_user.is_allowed_to_login())

    def test_update_password(self):
        user = CurationUser.objects.get(email="superuser@curation.com")
        new_password = "password"
        self.assertTrue(user.update_password(new_password, 10))
        user.is_active = True
        user.save()
        self.assertTrue(user.check_password(new_password))
