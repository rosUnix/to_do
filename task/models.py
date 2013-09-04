from django.db import models


class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    created_at = models.DateField()
    # status = models.CharField(max_length=30, choices=(
    #     ('waiting', 'Waiting to pick up'),
    #     ('in_progress', 'I am doing it, dude!'),
    #     ('done', 'YaY! Done!'),
    # )
