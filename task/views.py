# Create your views here.
from django.views.generic.list import ListView

from task.models import Task


class TaskList(ListView):
    model = Task
    template_name = 'task/list.html'
