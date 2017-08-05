
def get_router():
    from rest_framework.routers import DefaultRouter
    router = DefaultRouter(trailing_slash=False)
    return router
