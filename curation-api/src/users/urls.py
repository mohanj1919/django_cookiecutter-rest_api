
from django.conf.urls import url, include
from ..utilities.router import get_router

from .views import authView, userView

router = get_router()
router.register(r'users', userView.UserViewSet, 'users')
router.register(r'auth', authView.AuthViewSet, 'auth')

urlpatterns = [
    url(r'^', include(router.urls)),
]
