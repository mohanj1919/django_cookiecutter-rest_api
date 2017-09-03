import axios from 'lib/axios'
import _ from 'lodash'

export function _downloadAllCRFsByPatientId(patientData) {
  GetAvailableCRFS(patientData.project_id, patientData.patient_id)
}


export function GetAvailableCRFS(projectId, patientId) {
  try {
    let url = `/clinical/projects/${projectId}/`;
    axios.get(url).then(function (response) {
      let availableCRFS = response.data.project_crf_templates;

      let answers = {};
      _.map(response.data.project_crf_templates, function (item) {
        answers[item.id] = {}
      })

      let get_status_url = `clinical/chartreview/get_chart_review_status/?project_id=${projectId}&patient_id=${patientId}`
      axios.get(get_status_url).then(function (response) {
        _.map(availableCRFS, function (item) {
          let resultItem = _.find(response.data, (res) => {
            return res.crf_template_id == item.id
          });
          if (_.isEmpty(resultItem)) {
            item.status = 'NOTSTARTED';
          } else {
            item.status = resultItem.status
          }
        });
        GetQuestionsByTemplateId(projectId, patientId, availableCRFS[0].id)
      })
    }).catch(function (err) {

    })
  } catch (err) {
    //TODO: add error text
  }
}

export function GetQuestionsByTemplateId(projectId, patientId, templateId) {
  let url = `/clinical/crftemplates/${templateId}/`;
  axios.get(url).then(function (response) {
    let getAnswersUrl = `clinical/chartreview/answers/?patient_id=${patientId}&project_id=${projectId}&crfTemplate_id=${templateId}`
    let template = response.data;
    axios.get(getAnswersUrl)
      .then(function (response) {
        _.map(template.questions, function (item) {
           if (_.isEmpty(item.responses)) {
              item.responses = '';
            }
        });
      });
  })
}
