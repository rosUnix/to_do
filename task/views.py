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
                'status': task.status} for task in Task.objects.all()]

    return HttpResponse(json.dumps(taskList), content_type="application/json")


@csrf_exempt
def task(request):

    if request.method == 'POST':
        datas = json.loads(request.body)

        newTask = Task.objects.create(
            title=datas['title'],
            status=datas['status'])

        return HttpResponse(json.dumps({'id': newTask.id}), content_type="application/json")

    if request.method == 'PUT':
        data = json.loads(request.body)

        task = Task.objects.get(id=data['id'])
        task.title = data['title']
        task.status = data['status']
        task.save()

        return HttpResponse('{}', content_type="application/json")

    if request.method == 'DELETE':
        idTask = int(request.path.split('/')[2])
        task = Task.objects.get(id=idTask)
        task.delete()

        return HttpResponse('{}', content_type="application/json")
