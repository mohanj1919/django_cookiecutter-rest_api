from django.db import transaction
from django.db.models import Q
from django.http import Http404
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from rest_framework.exceptions import ValidationError

from ...utilities import ListModelViewMixin
from ..models import CRFTemplateQuestion, CRFTemplate
from ..serializers import (
    CRFTemplateListSerializer,
    CRFTemplateQuestionListSerializer,
    CRFTemplateQuestionSerializer,
    CRFTemplateSerializer,
    CRFTemplateRetrieveSerializer
)


class CRFTemplateView(viewsets.GenericViewSet,
                      ListModelViewMixin):
    queryset = CRFTemplate.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    model = CRFTemplate

    def _get_object(self, pk):
        try:
            return CRFTemplate.objects.get(pk=pk)
        except CRFTemplate.DoesNotExist:
            raise Http404

    def _get_crf_tempalte_question(self, pk):
        try:
            return CRFTemplateQuestion.objects.get(pk=pk)
        except CRFTemplateQuestion.DoesNotExist:
            raise Http404

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return CRFTemplateSerializer
        if self.action == 'retrieve':
            return CRFTemplateRetrieveSerializer
        return CRFTemplateListSerializer

    def filter_query_set(self, search_param):
        query = Q(name__icontains=search_param) | Q(description__icontains=search_param)
        return self.get_queryset().filter(query)

    def retrieve(self, request, pk=None):
        crf_template = self._get_object(pk)
        serializer = self.get_serializer(crf_template)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _create_crf_template_question(self, crf_template_id, questions_to_insert):
        questions = []

        for question in questions_to_insert:
            question['crf_template_id'] = crf_template_id
            question_serializer = CRFTemplateQuestionSerializer(data=question)

            if not question_serializer.is_valid():
                raise ValidationError({'errors': question_serializer.errors})

            crfQuestion = question_serializer.save()
            crfQuestion = CRFTemplateQuestionListSerializer(crfQuestion)
            questions.append(crfQuestion.data)
        return questions

    def _update_crf_template_question(self, questions_to_update):
        questions = []

        for question in questions_to_update:
            question_id = question.get('id')
            question_instance = self._get_crf_tempalte_question(question_id)
            question_serializer = CRFTemplateQuestionSerializer(question_instance, data=question)
            if not question_serializer.is_valid():
                raise ValidationError({'errors': question_serializer.errors})

            crf_question = question_serializer.save()
            # if a question is deleted (is_active=False) then update the child questions
            if not question.get('is_active', True):
                child_questions = CRFTemplateQuestion.objects.filter(parent_question=question_instance.question_id, is_active=True)
                child_questions.update(parent_question='', parent_condition='', parent_response='')
            crf_question_serializer = CRFTemplateQuestionListSerializer(crf_question)
            questions.append(crf_question_serializer.data)
        return questions

    @transaction.atomic
    def create(self, request):
        data = request.data
        serializer = CRFTemplateSerializer(data=data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        created_template = serializer.save()
        questions_to_insert = data.get('questions')

        try:
            questions = self._create_crf_template_question(created_template.id, questions_to_insert)
        except ValidationError as validation_error:
            raise validation_error

        obj = serializer.data
        obj['questions'] = questions
        return Response(obj, status=status.HTTP_201_CREATED)

    @staticmethod
    def get_diff_from_list_of_dictionaries(list1, list2):
        import itertools
        objects_in_list2_not_in_list1 = list(itertools.filterfalse(lambda x: x in list1, list2))
        objects_in_list1_not_in_list2 = list(itertools.filterfalse(lambda x: x in list2, list1))

        return {
            "objects_in_list1_not_in_list2": objects_in_list1_not_in_list2,
            "objects_in_list2_not_in_list1": objects_in_list2_not_in_list1,
        }

    def _delete_crf_template_questions(self, questions_to_be_deleted):
        for question in questions_to_be_deleted:
            question['is_active'] = False

        response = self._update_crf_template_question(questions_to_be_deleted)
        return response

    @transaction.atomic
    def update(self, requests, pk=None):
        data = requests.data
        instance = self._get_object(pk)
        serializer = CRFTemplateSerializer(instance, data=data)

        if serializer.is_valid() == False:
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_template = serializer.save()
        crfTemplateSerializer = CRFTemplateListSerializer(updated_template)
        questions = []

        questions_in_req = data.get('questions')
        questions_in_db = instance.questions.filter(is_active=True)
        questions_to_update = [a for a in questions_in_req if a.get('id', None) is not None]
        questions_to_insert = [a for a in questions_in_req if a.get('id', None) is None]

        try:
            self._create_crf_template_question(instance.id, questions_to_insert)
        except ValidationError as validation_error:
            raise validation_error

        try:
            self._update_crf_template_question(questions_to_update)
        except ValidationError as validation_error:
            raise validation_error

        crf_template_questions = CRFTemplateQuestion.objects.filter(crf_template_id=instance.id, is_active=True)
        questions = CRFTemplateQuestionListSerializer(crf_template_questions, many=True).data

        obj = crfTemplateSerializer.data
        obj['questions'] = questions
        return Response(obj, status=status.HTTP_200_OK)

    @transaction.atomic
    def destroy(self, request, pk=None):
        instance = self._get_object(pk)
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
