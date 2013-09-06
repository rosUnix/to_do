# Create your views here.
import json
from django.http import HttpResponse
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


def get_task_list(request):

    taskList = [{'id': task.id,
                'title': task.title,
                'desc': task.description,
                'created_at': task.created_at.strftime("%D"),
                'status': task.status} for task in Task.objects.all()]

    return HttpResponse(json.dumps(taskList), content_type="application/json")