from django.db import models
from django.contrib import admin

# Create your models here.
class Article(models.Model):
    author = models.CharField(max_length=50, blank=False, null=False)
    password = models.CharField(max_length=128, blank=False)
    date = models.DateTimeField(auto_now_add=True)
    deleted = models.BooleanField(default=False)
    parent = models.ForeignKey('self', null=True, blank=True)
    title = models.CharField(max_length=128, blank=False)
    content = models.TextField()

admin.site.register(Article)
