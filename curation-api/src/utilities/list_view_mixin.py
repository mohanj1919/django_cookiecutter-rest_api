from .sort_query_set import SortQuerySet

def paginate_data(self, request):
    req_params = request.GET
    search_param = req_params.get('searchParam', default=None)
    sort_name = req_params.get('sortName', default=None)
    sort_order = req_params.get('sortOrder', default='asc')
    queryset = self.get_queryset()

    if search_param is not None:
        queryset = self.filter_query_set(search_param)

    if sort_name is not None and sort_order is not None:
        queryset = SortQuerySet.sort(queryset, sort_name, sort_order, self.model)

    queryset = queryset if queryset is not None else self.filter_queryset(self.get_queryset())

    page = self.paginate_queryset(queryset)

    if page is not None:
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    else:
        return self.get_paginated_response([])

class ListModelViewMixin(object):
    """
    List a queryset.
    """
    def list(self, request):
        return paginate_data(self, request)

class ListModelGenericViewMixin(object):
    """
    Get all objects from queryset.
    """
    def patinate_response(self, request):
        return paginate_data(self, request)
