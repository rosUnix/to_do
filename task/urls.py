from django.conf.urls import patterns, url

from . import views


urlpatterns = patterns('',
    url(r'^$', views.TaskList.as_view(), name='tasks_list_view'),
    url(r'^task/$', views.TaskAPI.as_view(), name='create_task_api'),
    url(r'^task/(?P<id>\d+)/?', views.TaskAPI.as_view(), name='task_api'),
	url(r'^tasks/', views.TaskListAPI.as_view(), name='tasks_list_api'),
)