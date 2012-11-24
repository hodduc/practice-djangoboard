from board.models import Article
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import get_current_timezone
from collections import deque
import json

def index(request):
    return render(request, 'base.html')

def filter_dict(orm_object, filter_list):
    return { key: orm_object.__dict__[key] for key in filter_list }

@csrf_exempt
def list(request):
    articles = Article.objects.order_by('id').all()
    n = len(articles)
    ordered_articles = []

    def bt(curr):
        depth = articles[curr].__dict__['depth']
        ordered_articles.append(articles[curr])
        for i in xrange(n):
            if articles[i].parent_id == articles[curr].id:
                articles[i].__dict__['depth'] = depth + 1
                bt(i)

    for i in xrange(n):
        if articles[i].parent_id is None:
            articles[i].__dict__['depth'] = 0
            bt(i)

    r = [filter_dict(article, ('id', 'author', 'parent_id', 'title', 'depth')) for article in ordered_articles]
    return HttpResponse(json.dumps(r), mimetype='application/json')

@csrf_exempt
def write(request):
    data = request.POST

    article = Article()
    error = ''
    if 'author' not in data:
        error = 'Author is empty'
    if 'password' not in data:
        error = 'Password is empty'
    if 'title' not in data:
        error = 'Title is empty'
    if 'content' not in data:
        error = 'Content is empty'

    article.author = data.get('author', '')
    article.password = data.get('password', '')

    if 'parent' in data:
        try:
            article.parent = Article.objects.get(id=int(data.get('parent', '0')))
        except:
            error = 'Invalid approach'

    article.title = data.get('title', '')
    article.content = data.get('content', '')

    if not error:
        try:
            article.save()
        except:
            error = 'Internal Error'
        
    if error:
        r = {'success': 0, 'error': error}
    else:
        r = {'success': 1}

    return HttpResponse(json.dumps(r), mimetype='application/json')

@csrf_exempt
def read(request):
    data = request.POST

    error = ''
    if not data.get('id', '').isdigit():
        error = 'Invalid approach'

    try:
        article = Article.objects.get(id=int(data['id']))
    except:
        error = 'Not exist'

    if error:
        r = {'success': 0, 'error': error}
    elif article.deleted:
        r = {'success': 0, 'error': 'This article is deleted'}
    else:
        article_ = filter_dict(article, ('id', 'title', 'author', 'parent_id', 'content'))
        article_['date'] = article.date.astimezone(get_current_timezone()).strftime('%Y/%m/%d %H:%M')
        r = {'success': 1, 'article': article_}

    return HttpResponse(json.dumps(r), mimetype='application/json')

@csrf_exempt
def delete(request):
    data = request.POST

    error = ''
    if not data.get('id', '').isdigit():
        error = 'Invalid approach'
    
    try:
        article = Article.objects.get(id=int(data['id']))
    except:
        error = 'Not exist'

    if article.password == data.get('password', '!nopassword'):
        article.deleted = True
        article.save()
    else:
        error = 'Password mismatch'

    if error:
        r = {'success': 0, 'error': error}
    else:
        r = {'success': 1}

    return HttpResponse(json.dumps(r), mimetype='application/json')
