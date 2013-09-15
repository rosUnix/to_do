# Create your views here.
import json

from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import View
from django.views.generic.list import ListView

from task.models import Task


class CSRFExemptMixin(object):

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(CSRFExemptMixin, self).dispatch(*args, **kwargs)


class TaskList(ListView):
    model = Task


class TaskListAPI(View):
    def get(self, request, *args, **kwargs):
        taskList = [{'id': task.id,
                    'title': task.title,
                    'status': task.status} for task in Task.objects.all()]

        return HttpResponse(json.dumps(taskList), content_type="application/json")


class TaskAPI(CSRFExemptMixin, View):

    def post(self, request, *args, **kwargs):
        datas = json.loads(request.body)

        newTask = Task.objects.create(
            title=datas['title'],
            status=datas['status'])

        return HttpResponse(json.dumps({'id': newTask.id}), content_type="application/json")    

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)

        task = Task.objects.get(pk=kwargs['id'])
        task.title = data['title']
        task.status = data['status']
        task.save()

        return HttpResponse('{}', content_type="application/json")

    def delete(self, request, *args, **kwargs):
        task = Task.objects.get(pk=kwargs['id'])
        task.delete()

        return HttpResponse('{}', content_type="application/json")
