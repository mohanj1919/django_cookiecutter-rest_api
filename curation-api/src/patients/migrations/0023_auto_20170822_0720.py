# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-08-22 01:50
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0022_auto_20170821_1452'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='patientdemographic',
            name='patient_id',
        ),
        migrations.AddField(
            model_name='patientdemographic',
            name='patient',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='demographics', to='patients.Patient'),
        ),
        migrations.AlterField(
            model_name='encounter',
            name='patient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='encounters', to='patients.Patient'),
        ),
    ]