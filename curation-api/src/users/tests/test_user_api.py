from collections import OrderedDict
from json import dumps, loads

from django.conf import settings
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.request import Request
from rest_framework.test import APIClient

from ..models import CurationUser, CurationUserManager
from ..serializers.userSerializer import CreateUserSerializer, GroupSerializer, UserSerializer
from ..views.userView import UserViewSet


class CuratorUserTests(TestCase):
    def setUp(self):
        admin_user = CurationUser.objects._create_user(
            email="admin@curation.com",
            password="test",
            is_staff=True,
            is_superuser=False,
            is_active=True,
            first_name="super",
            last_name="user",
            id=20)
        group = Group.objects.get(name='admin')
        admin_user.groups.set([group])
        user = CurationUser.objects.get(email='mohan.jagabatthula@ggktech.com')
        self.client = APIClient()
        self.client.force_authenticate(user=user)

    def funk(self, User=None, token=None):
        self.client = APIClient()
        # self.Token.objects.get()
        dot = self.client.force_authenticate(user=User)
        #tokin = Token.objects.get(user_id=2)
        return dot

    def to_dict(self, input_ordered_dict):
        return loads(dumps(input_ordered_dict))

    def test_can_create_curator(self):
        curator = {
            'email': 'curator1@om1.com',
            'first_name': 'curator',
            'last_name': 'test',
            'mfa_type': 'sms',
            'phone_number': '0123456789',
            'groups': [2]
        }
        curator_response = self.client.post(
            '/users/',
            curator,
            format='json')

        self.assertEqual(curator_response.status_code, status.HTTP_201_CREATED)

    def test_create_invalid_curator(self):
        curator = {
            'email': 'curator12@om1.com',
            "first_name": 'curation',
            'last_name': 'test1',
            'mfa_type': 'sms',
            'phone_number': '0123456788'
        }
        curator_response = self.client.post('/users/', curator, format='json')
        self.assertEqual(curator_response.status_code,
                        status.HTTP_400_BAD_REQUEST)

    def test_create_duplicate_curator(self):
        payload = {'email': 'curator1@om1.com', "first_name": 'curator',
                    'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789'}
        CurationUser.objects.create(**payload)
        curator2 = payload
        curator2['groups'] = [2]
        curator_response = self.client.post(
            '/users/',
            curator2,
            format='json')

        self.assertEqual(curator_response.status_code,
                         status.HTTP_400_BAD_REQUEST)

    def test_get_curator(self):
        payload = {'email': 'curator1@om1.com', "first_name": 'curator',
                    'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789'}
        curationuser = CurationUser.objects.create(**payload)
        serializer = UserSerializer(curationuser)
        url = '/users/{}/'.format(curationuser.id)
        response = self.client.get(
            url,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def prepare_curation_user(self):
        i = 0
        curation_users = []
        while i < 3:
            j = i + 111
            curation_user = {
                'id': j,
                'email': 'curator{}@om1.com'.format(j),
                'first_name': 'first_name_{}'.format(j),
                'last_name': 'last_name_{}'.format(j),
                'mfa_type': 'sms',
                'phone_number': '012345678{}'.format(j),
            }
            i = i + 1
            user = CurationUser.objects.create(**curation_user)
            user.is_active = True
            user.save()
            curation_users.append(user)
        return curation_users

    def _create_a_curator(self):
        payload = {'email': 'new_curator@om1.com', "first_name": 'curator',
                    'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789'}
        return CurationUser.objects.create(**payload)

    def test_get_paged_curators(self):
        self.prepare_curation_user()
        page_size = 1
        response = self.client.get(
            '/users/?page_size={}'.format(page_size),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.data['results']
        self.assertEqual(len(response_data), page_size)

    def test_paginate_curators(self):
        curation_users = self.prepare_curation_user()
        page_size = 1
        page_number = 3
        response = self.client.get(
            '/users/?page={}'.format(page_number),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), len([]))

    def test_search_param(self):
        curation_users = self.prepare_curation_user()
        # ser = UserSerializer(curation_users, many=True)
        # print(ser.data)
        search_param = 'curator111@om1.com'
        response = self.client.get(
            '/users/?searchParam={}'.format(search_param),
            format='json')
        #data1 = UserViewSet.search(searchParam='0123456789')
        #data2 = CurationUserManager.get_user_details(user_ids=[10])
        data2 = CurationUser.objects.get(email=search_param)
        serializer_data = UserSerializer(data2).data
        data3 = self.to_dict(response.data['results'])
        self.assertEqual(serializer_data, data3[0])

    def test_destroy(self):
        curation_user = self._create_a_curator()
        response = self.client.delete(
            '/users/{}'.format(curation_user.id),
            format='json',
            follow=True)
        self.assertEquals(response.status_code, status.HTTP_200_OK)

    def test_unauthorized_delete_user(self):
        payload = {'email': 'curator1234@om1.com', "first_name": 'curator',
                    'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '4567895874'}
        curationuser = CurationUser.objects.create(**payload)
        curation_user = self._create_a_curator()
        client = APIClient()
        client.force_authenticate(curation_user)
        response = client.delete(
            '/users/{}'.format(curationuser.id),
            format='json',
            follow=True)
        self.assertEquals(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_destroy1(self):
        response = self.client.delete(
            '/users/{}'.format(675),
            format='json',
            follow=True)
        self.assertEquals(response.status_code,status.HTTP_404_NOT_FOUND)


#     def test_update(self):
#         self.test_can_create_curator()
#         curator_user = CurationUser.objects.get(email='curator1@om1.com')
#         curator = {'email': 'curator1@om1.com', "first_name": 'curation',
#                    'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789', 'groups': [2]}
#         response = self.client.put('/users/{}'.format(curator_user.id),curator,format='json')
#         data3=self.to_dict(response.data)
#         #data4 = data3[0]
#         self.assertEqual(response.status_code,status.HTTP_200_OK)
#         #self.assertContains('curation',data3)

#     # def test_update(self):
#     #     self.test_can_create_curator()
#     #     curator_user = CurationUser.objects.get(email='curator1@om1.com')
#     #     curator = {'email': 'curator1@om1.com', "first_name": 'curation',
#     #                'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789', 'groups': [2]}
#     #     response = self.client.post('/users/update_profile',curator,format='json')
#     #     data3=self.to_dict(response.data)
#     #     print(response.status_code)
#     #     print ('uhydbgavibx jvhbgwroiufgus')
#     #     print(data3)
#     #     print('hygbdzjgnvdliufzhgiodhgeugfi')
#     #     #data4 = data3[0]
#     #     self.assertEqual(response.status_code,status.HTTP_200_OK)
#     #     #self.assertContains('curation',data3)

    def test_get_roles(self):
        response = self.client.get('/users/get_roles/',format='json')
        data=self.to_dict(response.data)
        data1={'id':1,'name':'admin'}
        data2={'id':2,'name':'curator'}
        data3=[data1,data2]
        self.assertEquals(data,data3)

    def test_get_mfa_type(self):
        response = self.client.get('/users/get_mfatype/',format='json')
        data=self.to_dict(response.data)
        data1={'google':'google','sms':'sms'}
        self.assertEqual(data,data1)

    # def test_delete_authentication_token(self):
    #     curator = self._create_a_curator()
    #     serializer=UserSerializer(curator)
    #     #credentials={'email':'curator1@om1.com','password':'Curator@1'}
    #     #data=self.get_token(credentials)
    #     # print('::loggedInUser.id::', loggedInUser.id)
    #     token = Token.objects.get(curationuser_id=curator.id)
    #     UserViewSet()._delete_auth_token_(userId=curator.id)

#     def test_logout(self):
#         self.test_can_create_curator()
#         curationuser = CurationUser.objects.get(email='curator1@om1.com')
#         response = self.client.get('/users/logout',format='json')

#         self.assertEqual(response.status_code,status.HTTP_200_OK)

#     def test_reset_password_without_user(self):
#         curationusers=self.prepare_curation_user()
#         curator = CurationUser.objects.get(email='curator1@om1.com')
#         client = APIClient()
#         client.force_authenticate(user=curator)
#         response = self.client.get(
#             '/users/{}'.format(curator.id),
#             format='json')
#         response = self.client.get(
#             '/users/{}/reset_password'.format(curator.id),
#             format='json')
#         self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND)

#     def test_reset_password(self):
#         curationusers=self.prepare_curation_user()
#         curator = CurationUser.objects.get(email='curator1@om1.com')
#         # client = APIClient()
#         # client.force_authenticate(user=curator)
#         response = self.client.get(
#             '/users/{}'.format(curator.id),
#             format='json')
#         response = self.client.get(
#             '/users/{}/reset_password'.format(curator.id),
#             format='json')
#         self.assertEqual(response.status_code,status.HTTP_200_OK)


#     # def test_get_current_user_details(self):
#     #     curationusers=self.prepare_curation_user()
#     #     curator = CurationUser.objects.get(email='curator1@om1.com')
#     #     curator.is_active=True
#     #     curator.save()
#     #     client = APIClient()
#     #     client.force_authenticate(user=curator)
#     #     print('qwertyuioasdfghjklzxcvbnm')
#     #     #response = self.client.get('/users/{}/get_current_user_details'.format(curator.id),format='json')
#     #     response = self.client.get('/users/get_current_user_details',format='json')
#     #     print(response)
#     #     print('jhgsfcyhdsfchdukgohitdhgethoiughtdngbtndghtroighdlgtr')
#     #     print(response.status_code)
#     #     print('gysdlirfvbgidzksbhfueiogfvubxkvgbd;ougierbgvfubkvguhrdgo;ibuhut')
#     #     #data1=self.to_dict(response)
