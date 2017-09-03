
class SortQuerySet:
    @staticmethod
    def sort(queryset, sortName, sortOrder, model):
        descSortField = '-{}'.format(sortName)
        queryset = queryset if queryset is not None else model.objects
        if sortOrder == 'desc':
            sortedResults = queryset.order_by(descSortField)
        else:
            sortedResults = queryset.order_by(sortName)
        return sortedResults
