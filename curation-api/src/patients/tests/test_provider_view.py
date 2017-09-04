from json import loads, dumps
from collections import OrderedDict
from django.conf import settings
from django.contrib.auth.models import Group
from django.test import TestCase, Client
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import Group
from rest_framework.request import Request
from rest_framework.authtoken.models import Token
from ..models.provider import Provider
from ..serializers.provider import ProviderSerializer
from ..models.cohort import Cohort
from ..serializers.cohort import CohortSerializer
from ...users.models import CurationUser, CurationUserManager


class ProviderViewTests(TestCase):
    def setUp(self):
        self.cohortobj = Cohort.objects.create(name='Knee pain', description='knee pain patients')
        admin = CurationUser.objects.get(email='mohan.jagabatthula@ggktech.com')
        self.client = APIClient()
        self.client.force_authenticate(user=admin)
        Provider.objects.create(
            first_name='Nadeem', last_name='Saif', npi='npi Demo',
            specialty_code='sp_001', type='Demo', cohort=self.cohortobj)
        Provider.objects.create(
            first_name='Nadeem_2', last_name='Saif_2', npi='npi Demo_2',
            specialty_code='sp_002', type='Demo_2', cohort=self.cohortobj)
        Provider.objects.create(
            first_name='Nadeem_3', last_name='Saif_3', npi='npi Demo_3',
            specialty_code='sp_003', type='Demo_3', cohort=self.cohortobj)
        Provider.objects.create(
            first_name='Nadeem_4', last_name='Saif_4', npi='npi Demo_4',
            specialty_code='sp_004', type='Demo_4', cohort=self.cohortobj)

    def test_get_all_providers(self):
        url = '/clinical/domains/{domain_id}/providers/'.format(
            domain_id=self.cohortobj.id,
        )
        # get api Response
        response = self.client.get(url)
        # get data from db
        providers = Provider.objects.all()
        serializer = ProviderSerializer(providers, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_provider(self):
        provider = Provider.objects.get(first_name="Nadeem")
        # get api response
        url = '/clinical/domains/{domain_id}/providers/{provider_id}/'.format(
            domain_id=self.cohortobj.id,
            provider_id=provider.id
        )
        response = self.client.get(url)
        # get data from db
        serializer = ProviderSerializer(provider)
        self.assertEqual(response.data, serializer.data)

    def test_get_invalid_provider(self):
        # get api response
        url = '/clinical/domains/{domain_id}/providers/{provider_id}/'.format(
            domain_id=self.cohortobj.id,
            provider_id=500
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_pagesize_provider(self):
        # get api response
        url = '/clinical/domains/{domain_id}/providers/?page=1&page_size=2'.format(
            domain_id=self.cohortobj.id
        )
        response = self.client.get(url)
        # First page of size 2
        self.assertEqual(len(response.data['results']), 2)
        url = '/clinical/domains/{domain_id}/providers/?page=2&page_size=2'.format(
            domain_id=self.cohortobj.id
        )
        response = self.client.get(url)
        # second page of size 3
        self.assertEqual(len(response.data['results']), 2)

    def test_invalid_page_number_provider(self):
        url = '/clinical/domains/{domain_id}/providers/?page=4&page_size=2'.format(
            domain_id=self.cohortobj.id
        )
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 0)

    def test_create_valid_provider(self):
        payload = {
            'id': '4dbe5c7d-a03c-3a44-9245-7233fa0dcba5',
            'first_name': 'Rahamn',
            'last_name': 'Waseem',
            'npi': 'npi_post_demo',
            'specialty_code': 'specialty_code_post_demo',
            'type': 'Teast_type'
        }
        url = '/clinical/domains/{domain_id}/providers/'.format(
            domain_id=self.cohortobj.id
        )
        response = self.client.post(
            url,
            data=payload,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_invalid_provider(self):
        payload = {
            'id': '4dbe5c7d-a03c-3a44-9245-7233fa0dcba5',
            'first_name': {},
            'last_name': {},
            'npi': 'npi_post_demo',
            'specialty_code': 'specialty_code_post_demo',
            'type': 'Teast_type'
        }
        url = '/clinical/domains/{domain_id}/providers/'.format(
            domain_id=self.cohortobj.id
        )
        response = self.client.post(
            url,
            data=payload,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProviderDetailsViewTests(TestCase):
    def setUp(self):
        self.cohortobj = Cohort.objects.create(name='Krishna', description='Cohort TestCase')
        admin = CurationUser.objects.get(email='mohan.jagabatthula@ggktech.com')
        self.client = APIClient()
        self.client.force_authenticate(user=admin)
        self.provider = Provider.objects.create(
            first_name='Nadeem', last_name='Saif', npi='npi Demo',
            specialty_code='sp_001', type='Demo', cohort=self.cohortobj)

    def test_valid_update_provider(self):
        valid_payload = {
            'first_name': 'Karthik',
            'last_name': 'Krishna',
            'npi': 'npi_post_demo',
            'specialty_code': 'specialty_code_post_demo',
            'type': 'Teast_type',
            'user': {'email': 'nadeem.saif@ggktech.com'}
        }
        url = '/clinical/domains/{domain_id}/providers/{provider_id}/'.format(
            domain_id=self.cohortobj.id,
            provider_id=self.provider.id
        )
        response = self.client.put(
            url,
            data=valid_payload,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_update_provider(self):
        # first name required but its missing
        invalid_payload = {
            'first_name': {},
            'last_name': 'Krishna',
            'npi': 'npi_post_demo',
            'specialty_code': 'specialty_code_post_demo',
            'type': 'Teast_type',
            'user': {'email': {}}
        }
        url = '/clinical/domains/{domain_id}/providers/{provider_id}/'.format(
            domain_id=self.cohortobj.id,
            provider_id=self.provider.id
        )
        response = self.client.put(
            url,
            data=invalid_payload,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_provider(self):
        url = '/clinical/domains/{domain_id}/providers/{provider_id}/'.format(
            domain_id=self.cohortobj.id,
            provider_id=self.provider.id
        )
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
