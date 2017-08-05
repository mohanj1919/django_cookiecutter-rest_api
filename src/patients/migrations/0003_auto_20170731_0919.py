# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-07-31 09:19
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0002_auto_20170727_1539'),
    ]

    operations = [
        migrations.CreateModel(
            name='AdminSetting',
            fields=[
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('created_on', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('created_by', models.CharField(max_length=256, null=True)),
                ('updated_on', models.DateTimeField(auto_now=True, db_index=True)),
                ('updated_by', models.CharField(max_length=256, null=True)),
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('setting', models.CharField(max_length=100, unique=True)),
                ('text', models.CharField(blank=True, max_length=100, null=True)),
                ('type', models.CharField(max_length=20)),
                ('value', models.TextField()),
                ('settings_group', models.CharField(blank=True, default='', max_length=100, null=True)),
            ],
            options={
                'db_table': 'curation_admin_setting',
            },
        ),
        migrations.AlterField(
            model_name='crfquestion',
            name='text',
            field=models.CharField(db_index=True, max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='crfquestion',
            name='type',
            field=models.TextField(),
        ),
        migrations.AlterUniqueTogether(
            name='projectcrftemplate',
            unique_together=set([('project', 'crf_template')]),
        ),
    ]
