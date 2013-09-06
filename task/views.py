# Create your views here.
from django.views.generic.list import ListView
from django.views.generic.edit import UpdateView

from task.models import Task


class TaskList(ListView):
    model = Task
    template_name = 'task/list.html'

    # def get(self, request, *args, *kwargs):
    #    pass


class TaskView(UpdateView):
    model = Task
