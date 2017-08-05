# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import include, url
from rest_framework_swagger.views import get_swagger_view

schema_view = get_swagger_view(title='Curator API')

urlpatterns = [
    # User management
    url('^', include('src.users.urls')),
    url('^', include('src.patients.urls')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # Swagger
    url(r'^api-docs/$', schema_view),
]
