from django.db import models
from django.conf import settings


class Task(models.Model):
    title = models.CharField(max_length=50, unique=True)
    created_at = models.DateField()
    status = models.CharField(max_length=30, choices=settings.TASK_CHOICES)

    def __unicode__(self):  # pragma: no cover
        return self.title
