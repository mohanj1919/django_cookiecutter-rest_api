from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.utils import six
from django.core.paginator import InvalidPage
from rest_framework.exceptions import NotFound

class CustomPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    page_query_param = 'page'
    queryset = None

    def paginate_queryset(self, queryset, request, view=None):
        """
        Paginate a queryset if required, either returning a
        page object, or `None` if pagination is not configured for this view.
        """
        self.queryset = queryset
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = self.django_paginator_class(queryset, page_size)
        page_number = request.query_params.get(self.page_query_param, 1)
        if page_number in self.last_page_strings:
            page_number = paginator.num_pages

        try:
            self.page = paginator.page(page_number)
        except InvalidPage as exc:
            self.page = None
            return None

        if paginator.num_pages > 1 and self.template is not None:
            # The browsable API should display pagination controls.
            self.display_page_controls = True

        self.request = request
        return list(self.page)

    def get_paginated_response(self, data):
        count = self.queryset.count()
        if self.page is not None and self.page.paginator is not None:
            count = self.page.paginator.count
        return Response({
            'count': count,
            'results': data
        })
