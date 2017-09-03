from json import loads, dumps
from collections import OrderedDict
from django.conf import settings
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import Group
from rest_framework.request import Request
from rest_framework.authtoken.models import Token
from ..models import CurationUser, CurationUserManager
from ..serializers.userSerializer import CreateUserSerializer, UserSerializer, GroupSerializer
from ..views.userView import UserViewSet


class CuratorUserTests(TestCase):
    def setUp(self):
        CurationUser.objects._create_user(
            email="admin@curation.com",
            password="test",
            is_staff=True,
            is_superuser=False,
            is_active=True,
            first_name="super",
            last_name="user",
            id=1235)

        admin = CurationUser.objects.get(email='admin@curation.com')
        self.client = APIClient()
        self.client.force_authenticate(user=admin)

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
        # user = CurationUser.objects.get(email='curator1@om1.com')
        # user.is_active = True
        # user.save()
        print('***************')
        print(curator_response)
        print('***************')
        self.assertEqual(curator_response.status_code,
                        status.HTTP_201_CREATED)

#     def test_can_create1_curator(self):
#         curator = {
#             'email': 'curator12@om1.com',
#             "first_name": 'curation',
#             'last_name': 'test1',
#             'mfa_type': 'sms',
#             'phone_number': '0123456788',
#             'groups':[2]
#         }
#         curator_response = self.client.post('/users',curator,format='json')
#         # self.assertTrue(ValidationError({
#         #          "groups": "No group provided",
#         #      }) is raised)
#         self.assertEqual(curator_response.status_code,
#                         status.HTTP_201_CREATED)

#     def test_create_duplicate_curator(self):
#         curator1 = {'email': 'curator1@om1.com', "first_name": 'curator',
#                     'last_name': 'test', 'mfa_type': 'sms', 'phone_number': '0123456789'}
#         curator1 = CurationUser.objects.create(**curator1)
#         curator1.save()
#         curator2 = {'email': 'curator1@om1.com', "first_name": 'curator',
#                     'last_name': 'test', 'mfa_type': 'sms', 'groups': [2]}
#         curator_response = self.client.post(
#             '/users',
#             curator2,
#             format='json')

#         self.assertEqual(curator_response.status_code,
#                          status.HTTP_400_BAD_REQUEST)

#     def test_get_curator(self):
#         self.test_can_create_curator()
#         curationuser = CurationUser.objects.get(email='curator1@om1.com')
#         serializer = UserSerializer(curationuser)
#         response = self.client.get(
#             '/users/{}'.format(curationuser.id),
#             format='json'
#         )
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data, serializer.data)

#     def prepare_curation_user(self):
#         i = 0
#         curation_users = []
#         while i < 10:
#             curation_user = {
#                 'email': 'curator{}@om1.com'.format(i),
#                 'first_name': 'first name {}'.format(i),
#                 'last_name': 'last name {}'.format(i),
#                 'mfa_type': 'sms',
#                 'phone_number': '012345678{}'.format(i),
#             }
#             i = i + 1
#             user = CurationUser.objects.create(**curation_user)
#             user.is_active = True
#             user.save()
#             curation_users.append(user)
#         #curation_users_data = CurationUser.objects.bulk_create(curation_users)
#         return curation_users

#     def test_get_paged_curators(self):
#         curation_users = self.prepare_curation_user()
#         page_size = 10
#         response = self.client.get(
#             '/users?page_size={}'.format(page_size),
#             format='json'
#         )
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data['count'], len(curation_users))

#     def test_paginate_curators(self):
#         curation_users = self.prepare_curation_user()
#         page_size = 10
#         page_number=3
#         response = self.client.get(
#             '/users?page={}'.format(page_number),
#             format='json'
#         )
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data['results']), len([]))

#     def test_search_param(self):
#         curation_users = self.prepare_curation_user()
#         # ser = UserSerializer(curation_users, many=True)
#         # print(ser.data)
#         search_param = 'curator9@om1.com'
#         response = self.client.get(
#             '/users?searchParam={}'.format(search_param), format='json')
#         #data1 = UserViewSet.search(searchParam='0123456789')
#         #data2 = CurationUserManager.get_user_details(user_ids=[10])
#         data2 = CurationUser.objects.get(email=search_param)
#         serializer = UserSerializer(data2)
#         data2 = serializer.data
#         data3 = self.to_dict(response.data['results'])
#         data4 = data3[0]
#         self.assertEqual(data2, data4)

#     def test_sorting(self):
#         sortName = 'first_name'
#         curation_users = self.prepare_curation_user()
#         response = self.client.get('/users?(sortName={})'.format(sortName), format='json')
#         data2 = self.to_dict(response.data['results'])
#         serializer = UserSerializer(data=curation_users,many=True)
#         serializer.is_valid()
#         data1=serializer.data
#         data1=self.to_dict(data1)
#         self.assertEquals(data2,data1)


#     # def test_search_param(self):
#     #     curation_users = self.prepare_curation_user()
#     #     # ser = UserSerializer(curation_users, many=True)
#     #     # print(ser.data)
#     #     search_param = 'curator9@om1.com'
#     #     response = self.client.get(
#     #         '/users?searchParam={}'.format(search_param), format='json')
#     #     #data1 = UserViewSet.search(searchParam='0123456789')
#     #     #data2 = CurationUserManager.get_user_details(user_ids=[10])
#     #     data2 = CurationUser.objects.get(email=search_param)
#     #     serializer = UserSerializer(data2)
#     #     data2 = serializer.data
#     #     data3 = self.to_dict(response.data['results'])
#     #     data4 = data3[0]
#     #     self.assertEqual(data2, data4)

#     # def test_destroy(self):
#     #     self.test_can_create_curator()
#     #     curation_user = CurationUser.objects.get(email='curator1@om1.com')
#     #     response = self.client.delete(
#     #         '/users/{}'.format(curation_user.id),
#     #         format='json',
#     #         follow=True)
#     #     self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)

#        #"this test is failing without errors,instead of 405 404 error is coming."
#     def test_destroy1(self):
#         #CurationUser.objects.create_user(email='admin3@om1.com', password='Admin@3',first_name='subject3', last_name='object3')
#         self.test_can_create_curator()
#         curator = CurationUser.objects.get(email='curator1@om1.com')
#         client = APIClient()
#         curator.is_active=True
#         curator.save()
#         client.force_authenticate(user=curator)
#         res=client.get('/users',format='json')
#         response = client.delete(
#             '/users/{}'.format(curator.id),
#             format='json',
#             follow=True)
#         #UserViewSet.destroy(request='delete',pk='id')
#         self.assertEquals(response.status_code,status.HTTP_404_NOT_FOUND)


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

#     def test_get_roles(self):
#         response = self.client.get('/users/get_roles',format='json')
#         data=self.to_dict(response.data)
#         data1={'id':1,'name':'admin'}
#         data2={'id':2,'name':'curator'}
#         data3=[data1,data2]
#         self.assertEquals(data,data3)
#     def test_get_mfa_type(self):
#         curation_users = self.prepare_curation_user()
#         curation_user = CurationUser.objects.get(email='curator1@om1.com')
#         response = self.client.get('/users/get_mfatype',format='json')
#         data=self.to_dict(response.data)
#         data1={'google':'google','sms':'sms'}
#         self.assertEqual(data,data1)

#     def test_delete_authentication_token(self):
#         self.test_can_create_curator()
#         curator = CurationUser.objects.get(email='curator1@om1.com')
#         serializer=UserSerializer(curator)
#         self.funk(curator)
#         self.client.get('/users')
#         #credentials={'email':'curator1@om1.com','password':'Curator@1'}
#         #data=self.get_token(credentials)
#         # print('::loggedInUser.id::', loggedInUser.id)
#         asd=Token.objects.all()
#         UserViewSet._delete_auth_token_(self,userId=1)


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
