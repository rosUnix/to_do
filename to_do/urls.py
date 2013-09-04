from django.conf.urls import patterns, include, url
from task.views import TaskList

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', TaskList.as_view(), name='TaskList'),
    url(r'^admin/', include(admin.site.urls)),
)
