# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-08-22 09:19
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0026_auto_20170822_0747'),
    ]

    operations = [
        migrations.AlterField(
            model_name='diagnosis',
            name='principal_dx',
            field=models.NullBooleanField(),
        ),
        migrations.AlterField(
            model_name='encounter',
            name='place_of_service',
            field=models.CharField(max_length=100, null=True),
        ),
    ]