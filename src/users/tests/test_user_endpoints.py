from django.conf import settings
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from ..models import CurationUser, CurationUserManager
from ..serializers.userSerializer import CreateUserSerializer, UserSerializer
from ..views.userView import UserViewSet


class CuratorUserTests(TestCase):
    def setUp(self):
        password = settings.DEFAULT_PASSWORD
        admin = CurationUser.objects.get(email='admin@om1.com')
        self.client = APIClient()
        self.client.force_authenticate(user=admin)
        admin.delete()

    def test_can_create_curator(self):
        curator = {'email': 'curator1@om1.com', "first_name": 'curator',
                   'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789', 'groups': [2]}
        curator_response = self.client.post(
            '/users',
            curator,
            format='json')
        self.assertEqual(curator_response.status_code,
                         status.HTTP_201_CREATED)

    def test_create_duplicate_curator(self):
        curator1 = {'email': 'curator1@om1.com', "first_name": 'curator',
                    'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789'}
        curator1 = CurationUser.objects.create(**curator1)
        curator1.save()
        curator2 = {'email': 'curator1@om1.com', "first_name": 'curator',
                    'last_name': 'test', 'mfa_type': 'sms', 'groups': [2]}
        curator_response = self.client.post(
            '/users',
            curator2,
            format='json')

        self.assertEqual(curator_response.status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_get_curator(self):
        self.test_can_create_curator()
        curationuser = CurationUser.objects.get(email='curator1@om1.com')
        serializer = UserSerializer(curationuser)
        response = self.client.get(
            '/users/{}'.format(curationuser.id),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    # def prepare_curation_user(self):
    #     i = 0
    #     curation_users = []
    #     while i < 10:
    #         curation_user = {
    #             'email': 'curator{}@om1.com'.format(i),
    #             'first_name': 'first name {}'.format(i),
    #             'last_name': 'last name {}'.format(i),
    #             'mfa_type': 'sms',
    #             'phone_number': '012345678{}'.format(i),
    #         }
    #         curation_users.append(curation_user)
    #         i = i+1
    #     curation_users_data = CurationUser.objects.bulk_create(curation_users)
    #     return curation_users_data

    # def test_get_curators(self):
    #     curation_users = self.prepare_curation_user()
    #     page_size = 10
    #     response = self.client.get(
    #         '/users?page_size={}'.format(page_size),
    #         format='json'
    #     )
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertCountEqual(response.data, len(curation_users))

    # def test_search(self):
    #     queryset = CurationUser.objects.all()
    #     self.response = self.client.get(
    #         '/users?searchParam= subject2', queryset, format='json')
    #     data1 = UserViewSet.search(searchParam='subject2')
    #     data2 = CurationUserManager.get_user_details(user_ids=[2])
    #     self.assertContains(data1, data2)

    # def test_sort(self):
    #     CurationUserManager.create_superuser(email='admin3@om1.com', password='Admin@3', is_staff=True,
    #                                          is_superuser=True, is_active=True, first_name='subject3', last_name='object3')
    #     CurationUserManager.create_user(email='curator2@om1.com', password='Curator@2', is_staff=False,
    #                                     is_superuser=False, is_active=False, first_name='subject4', last_name='object4')
    #     queryset = CurationUser.objects.all()
    #     self.client.get('/users/?(sortName=first_name)',
    #                     queryset, format='json')
    #     sortName = request.get('sortName')
    #     dita = UserViewSet.sort(queryset, sortName)
    #     data1 = {'id':  1, 'email':  'admin@om1.com', 'first_name':  'admin', 'last_name':  'user', 'is_active':  True}
    #     data2 = {'id':  2, 'email':  'admin2@omi.com', 'first_name':  'subject1', 'last_name':  'object1', 'is_active':  True, 'groups':  [1]}
    #     data3 = {'id':  3, 'email':  'curator1@omi.com', 'first_name':  'subject3', 'last_name':  'object3', 'is_active':  True, 'groups':  [2]}
    #     data4 = {'id':  4, 'email':  'admin3@om1.com', 'first_name':  'subject3', 'last_name':  'object3', 'is_active':  True, 'groups':  [1]}
    #     data5 = {'id':  5, 'email':  'curator2@om1.com', 'first_name':  'subject4', 'last_name':  'object4', 'is_active':  True, 'groups':  [2]}
    #     data1 = UserSerializer(data=data1)
    #     data2 = UserSerializer(data=data2)
    #     data3 = UserSerializer(data=data3)
    #     data4 = UserSerializer(data=data4)
    #     data5 = UserSerializer(data=data5)
    #     data = {data1, data2, data3, data4, data5}
    #     self.assertAlmostEquals(data, dita)

    # def test_destroy(self):
    #     CurationUserManager.create_superuser(email='admin3@om1.com', password='Admin@3', is_staff=True,
    #                                          is_superuser=True, is_active=True, first_name='subject3', last_name='object3')
    #     curationuser = CurationUser.objects.get(id=4)
    #     response = self.client.delete(
    #         '/users', kwargs={'pk': curationuser.id},
    #         format='json',
    #         follow=True)
    #     self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)

    # def test_destroy2(self):
    #     CurationUserManager.create_superuser(email='admin3@om1.com', password='Admin@3', is_staff=True,
    #                                          is_superuser=True, is_active=True, first_name='subject3', last_name='object3')
    #     user = CurationUser.objects.get()
    #     UserViewSet.destroy(request='delete', kwargs={'pk': user.id})
    #     self.assertEquals(response.status_code.status.HTTP_204_NO_CONTENT)
    #     self.assertEqual(request.user.is_active, False)

    # def test_pagination(self):
    #     self.client = APIClient()
    #     response = self.client.get(
    #         '/users/?(page=1&page_size=3)', {'pk': curationusers.id}, format='json', follow=True)
    #     queryset = CurationUser.objects.all()
    #     page = self.paginate_queryset(queryset)
    #     serializer = self.UserSerializer(page, many=True)
    #     curationusers = self.get_paginated_response(serializer.data)
    #     response = self.client.get(
    #         '/users/?(page=1&page_size=3)', {'pk': curationusers.id}, format='json', follow=True)

    #     data2 = CurationUserManager.get_user_details(user_ids=[1, 2, 3])
    #     self.assertEqual(self.response.data, data2)

    # def test_pagination_with_no_page(self):
    #     self.client = APIClient()
    #     queryset = CurationUser.objects.all()
    #     page = self.paginate_queryset(queryset)
    #     serializer = self.UserSerializer(page, many=True)
    #     curationusers = self.get_paginated_response(serializer.data)
    #     response = self.client.get(
    #         '/users?(page_size=3)', {'pk': curationusers.id}, format='json', follow=True)
    #     data2 = CurationUserManager.get_user_details(user_ids=[1, 2, 3])
    #     self.assertEqual(self.response.data, data2)
