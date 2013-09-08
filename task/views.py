# Create your views here.
import datetime
import json

from django.http import HttpResponse
from django.views.generic.list import ListView
from django.views.decorators.csrf import csrf_exempt

from task.models import Task


class TaskList(ListView):
    model = Task
    template_name = 'task/list.html'


def get_task_list(request):

    taskList = [{'id': task.id,
                'title': task.title,
                'created_at': task.created_at.strftime("%D"),
                'status': task.status} for task in Task.objects.all()]

    return HttpResponse(json.dumps(taskList), content_type="application/json")


@csrf_exempt
def create_task(request):

    if request.method == 'POST':
        datas = json.loads(request.body)
        datas['created_at'] = datetime.datetime.now().strftime("%Y-%m-%d")

        newTask = Task.objects.create(
            title=datas['title'],
            status=datas['status'],
            created_at=datas['created_at'])

        return HttpResponse(json.dumps({'id': newTask.id, 'created_at': newTask.created_at}), content_type="application/json");
