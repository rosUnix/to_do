import datetime

from django.db import models
from django.conf import settings


class Task(models.Model):
    title = models.CharField(max_length=250, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=settings.TASK_CHOICES)

    class Meta:
        ordering = ('-created_at',)

    def __unicode__(self):  # pragma: no cover
        return self.title
