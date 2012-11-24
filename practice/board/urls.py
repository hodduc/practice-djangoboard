from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'board.views.index'),
    url(r'^list/$', 'board.views.list'),
    url(r'^read/$', 'board.views.read'),
    url(r'^write/$', 'board.views.write'),
    url(r'^delete/$', 'board.views.delete'),
)
