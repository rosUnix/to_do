# Create your views here.
from django.views.generic.list import ListView

from task.models import Task


class TaskList(ListView):
    model = Task
    template_name = 'base.html'

    def get_queryset(self):
        pass

    def get_context_data(self, **kwargs):
        pass
