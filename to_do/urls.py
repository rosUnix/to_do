from django.conf.urls import patterns, include, url
from task.views import TaskList, get_task_list, create_task

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', TaskList.as_view(), name='TaskList'),
    url(r'^task/', create_task, name='create_task'),
    url(r'^tasks/', get_task_list, name='get_task_list'),
    url(r'^admin/', include(admin.site.urls)),
)


"""
MyModel = Backbone.Model.extend({

url: function(){ "API/"
      return "API/MyModel/" +this.get("id");
    }
});

MyCollection = Backbone.Collection.extend({
    model: MyModel ,
    url: "API/MyModels"
});
"""
