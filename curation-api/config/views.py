from django.shortcuts import render
from django.conf import settings

def index(request, path=''):
    """
    Renders the Angular2 SPA
    """
    # import pdb;pdb.set_trace()
    return render(request, 'index.html')
