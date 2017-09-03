import axios from 'lib/axios';
import config from '../../../../../config';
import {
  HIDE_BANNER,
  TOGGLE_NOTIFICATION,
  TOGGLE_LOADING
} from '../../../../../modules/global.js';
import _ from 'lodash'
import {
  browserHistory
} from 'react-router'

const SET_PROP = 'SET_PROP';
const CLEAR_DATA = 'CLEAR_DATA';
const CURATORS_LIST = 'CURATORS_LIST';
const COHORTS_LIST = 'COHORTS_LIST';
const CRF_LIST = 'CRF_LIST';

export function handleEvent(e) {
  return (dispatch, getState) => {
    let projectDetails = getState().projectsconfigure.project;
    projectDetails[e.target.name] = e.target.value;

    switch (e.target.name) {
      case 'name':
        projectDetails.validationState = null;
        if (!projectDetails.name) {
          projectDetails.validationState = 'error';
        }
        break;
      case 'description':
        projectDetails.descriptionValidationState = null;
        if (!projectDetails.description) {
          projectDetails.descriptionValidationState = 'error';
        }
        break;
    }

    var formObj = {
      project: { ...projectDetails
      }
    }
    return dispatch({
      type: SET_PROP,
      payload: { ...formObj
      }
    })
  }
}

export function ToggleLoading(showLoader = false) {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_LOADING,
      payload: showLoader
    })
  };
}

export function handleCheckBoxEvent(e) {
  return (dispatch, getState) => {
    let obj = {
      [e.target.name]: e.target.checked
    }
    return dispatch({
      type: SET_PROP,
      payload: { ...obj
      }
    })
  }
}

export function GetCohortById(id) {
  return (dispatch, getState) => {
    let url = config.api.projects + `${id}/`;
    axios.get(url).then(function (response) {
      let cohort = {
        project: {
          name: response.data.name,
          description: response.data.description
        },
        cohort_id: response.data.id,
        curators: {
          assignedCurators: [],
          usersEmail: getState().projectsconfigure.curators.usersEmail
        },
        cohorts: {
          assignedCohorts: [],
          availableCohorts: getState().projectsconfigure.cohorts.availableCohorts,
          allCohorts: getState().projectsconfigure.cohorts.allCohorts
        },
        CRFTemplates: {
          options: getState().projectsconfigure.CRFTemplates.options,
          selectedTemplates: []
        }
      };

      dispatch({
        type: SET_PROP,
        payload: { ...cohort
        }
      })

      response.data.project_curators.map((item) => {
        dispatch(AddCurator([item]))
      })

      response.data.project_cohorts.map((item) => {
        dispatch(AddCohort([item]))
      })

      response.data.project_crf_templates.map((item) => {
        dispatch({
          type: SET_PROP,
          payload: {
            currentTemplate: item
          }
        })
        dispatch({
          type: SET_PROP,
          payload: {
            currentTemplateRequired: item.is_required
          }
        })
        dispatch(AddTemplate())
      })
      dispatch(ToggleLoading(false));

    }).catch(function (err) {
      dispatch({
        type: TOGGLE_NOTIFICATION,
        payload: true,
        showTime: 3000,
        showType: 'error',
        showMessage: 'Unable to load Project'
      })
    })
  }
}

export function SaveCohort() {
  return (dispatch, getState) => {
    let projectName = getState().projectsconfigure.project.name;
    let projectDescription = getState().projectsconfigure.project.description;
    let errors = {};
    if (!_.trim(projectName)) {
      errors.validationState = 'error';
      errors.nameErrorMessage = `This field can't be empty`;
    }
    if (!_.trim(projectDescription)) {
      errors.descriptionValidationState = 'error';
      errors.descriptionErrorMessage = `This field can't be empty`;
    }
    if (!_.isEmpty(errors)) {
      let project = {
        name: projectName,
        description: projectDescription,
        ...errors
      };
      return dispatch({
        type: SET_PROP,
        payload: {
          project: { ...project
          }
        }
      })
    }

    let cohortObj = {
      name: projectName,
      description: projectDescription,
      curators: _.map(getState().projectsconfigure.curators.assignedCurators, (item) => {
        return item.id
      }),
      cohorts: _.map(getState().projectsconfigure.cohorts.assignedCohorts, (item) => {
        return item.id
      }),
      crf_templates: _.map(getState().projectsconfigure.CRFTemplates.selectedTemplates, (item) => {
        return {
          id: item.id,
          is_required: item.isRequired
        }
      })
    };
    if (getState().projectsconfigure.cohort_id) {
      let url = config.api.projects
      url = url + `${getState().projectsconfigure.cohort_id}/`
      axios.put(url, cohortObj).then(function (response) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'success',
          showMessage: 'Project updated Successfully'
        })
        browserHistory.push('/projects')
      }).catch(function (err) {
       return dispatch(_showServerErrors(err));
      })
    } else {
      axios.post(config.api.projects, cohortObj).then(function (response) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'success',
          showMessage: 'Project added Successfully'
        })
        browserHistory.push('/projects')
      }).catch(function (err) {
          
        return dispatch(_showServerErrors(err));
      })
    }
  }
}

var _showServerErrors = function (err) {
  return (dispatch, getState) => {
    let serverErrors = _.get(err.response.data, 'errors', {})
    let projectName = getState().projectsconfigure.project.name;
    let projectDescription = getState().projectsconfigure.project.description;
    let errors = {};
    if (_.get(serverErrors, 'name', null)) {
      errors.validationState = 'error';
      errors.nameErrorMessage = _.upperFirst(_.get(serverErrors, 'name', null));
    }
    if (_.get(serverErrors, 'description', null)) {
      errors.descriptionValidationState = 'error';
      errors.descriptionErrorMessage = _.upperFirst(_.get(serverErrors, 'description', null));
    }
    if (_.get(serverErrors, 'cohorts', null)) {
        //errors.cohortValidationState = _.upperFirst(_.get(serverErrors, 'cohorts', null).join());
        dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: 6000,
            showType: 'error',
            showMessage: _.upperFirst(_.get(serverErrors, 'cohorts', null).join())
          })
          dispatch(ToggleLoading(true));
          return dispatch(FetchUsers(getState().projectsconfigure.cohort_id))
    }
    if (_.get(serverErrors, 'curators', null)) {
        dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: 6000,
            showType: 'error',
            showMessage: _.upperFirst(_.get(serverErrors, 'curators', null).join())
          })
          dispatch(ToggleLoading(true));
          return dispatch(FetchUsers(getState().projectsconfigure.cohort_id))
    }
    if (_.get(serverErrors, 'crf_templates', null)) {
        dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: 6000,
            showType: 'error',
            showMessage: _.upperFirst(_.get(serverErrors, 'crf_templates', null).join())
          })
          dispatch(ToggleLoading(true));
          return dispatch(FetchUsers(getState().projectsconfigure.cohort_id))
    }
    let project = {
      name: projectName,
      description: projectDescription,
      ...errors
    };
    dispatch({
      type: SET_PROP,
      payload: {
        project: { ...project
        }
      }
    })
   
  }
}


export function CancelProject() {
  return (dispatch, getState) => {
    dispatch({
      type: SET_PROP,
      payload: {
        HideBanner: false
      }
    })
    dispatch({
      type: TOGGLE_NOTIFICATION,
      payload: true,
      showTime: null,
      showType: 'warning',
      showMessage: `Are you sure want to cancel the operation?`,
      messageTitle: 'Cancel Editing Project',
      successCb: function () {
        browserHistory.push('/projects')
      }
    })
  }
}

// Curator TypeAHead functions

export function AddCurator(e) {
  return (dispatch, getState) => {
    if (!e[0] || e[0] == undefined) return;
    var user = e[0];
    var curators = _.clone(getState().projectsconfigure.curators.assignedCurators);
    var usersEmail = _.clone(getState().projectsconfigure.curators.usersEmail);

    curators.push(user);
    let removeFromUsers = _.remove(usersEmail, (i) => {
      return i.id == user.id;
    });
    if (!removeFromUsers.length) {
      return;
    }
    dispatch({
      type: SET_PROP,
      payload: {
        curators: {
          assignedCurators: curators,
          usersEmail: usersEmail
        }
      }
    })
  }
}

export function RemoveCurator(e) {
  return (dispatch, getState) => {
    var curators = _.clone(getState().projectsconfigure.curators.assignedCurators);
    var usersEmail = getState().projectsconfigure.curators.usersEmail;

    let removedCurator = _.remove(curators, (i) => {
      return i.id == e.target.value;
    });

    usersEmail.push.apply(usersEmail, removedCurator);
    dispatch({
      type: SET_PROP,
      payload: {
        curators: {
          assignedCurators: curators,
          usersEmail: usersEmail
        }
      }
    })
    e.preventDefault();
  }
}

// Cohort TypeAHead functions

export function AddCohort(e) {
  return (dispatch, getState) => {
    if (!e[0] || e[0] == undefined) return;
    var cohort = e[0];
    var cohorts = _.clone(getState().projectsconfigure.cohorts.assignedCohorts);

    if (_.find(cohorts, (item) => item.id == cohort.id)) {
      return;
    }
    cohorts.push(cohort);

    var availableCohorts = _.clone(getState().projectsconfigure.cohorts.availableCohorts);
    let cohortAdded = _.remove(availableCohorts, (i) => {
      return i.id == e[0].id;
    });
    if (!cohortAdded.length) {
      return;
    }
    dispatch({
      type: SET_PROP,
      payload: {
        cohorts: {
          assignedCohorts: cohorts,
          availableCohorts: availableCohorts
        }
      }
    })

  }
}

export function clearInstance(instance) {
  return (dispatch) => {
    if (instance) {
      instance.getInstance().clear()
    }
  }
}

export function RemoveCohort(e) {
  return (dispatch, getState) => {
    var cohorts = _.clone(getState().projectsconfigure.cohorts.assignedCohorts);
    var usersEmail = getState().projectsconfigure.cohorts.availableCohorts;
    let addToCohorts = _.remove(cohorts, (i) => {
      return i.id == e.target.value;
    });

    usersEmail.push.apply(usersEmail, addToCohorts);
    dispatch({
      type: SET_PROP,
      payload: {
        cohorts: {
          assignedCohorts: cohorts,
          availableCohorts: usersEmail,
          allCohorts: getState().projectsconfigure.cohorts.allCohorts
        }
      }
    })
    e.preventDefault();
  }
}


// CRFTemplate TypeAHead functions

export function SelectTemplate(e) {
  return (dispatch, getState) => {
    if (!e[0] || e[0] == undefined) return;
    dispatch({
      type: SET_PROP,
      payload: {
        currentTemplate: e[0]
      }
    })
  }
}

export function AddTemplate() {
  return (dispatch, getState) => {
    if (!getState().projectsconfigure.currentTemplate) return;
    var selectedTemplates = _.clone(getState().projectsconfigure.CRFTemplates.selectedTemplates);
    let template = getState().projectsconfigure.currentTemplate;

    if (_.find(selectedTemplates, (item) => item.id == template.id)) {
      return;
    }

    template.isRequired = getState().projectsconfigure.currentTemplateRequired
    selectedTemplates.push(template);

    var availableTemplates = _.clone(getState().projectsconfigure.CRFTemplates.options);
    _.remove(availableTemplates, (i) => {
      return i.id == template.id;
    });
    dispatch({
      type: SET_PROP,
      payload: {
        currentTemplateRequired: false
      }
    })
    dispatch({
      type: SET_PROP,
      payload: {
        currentTemplate: null
      }
    })
    dispatch({
      type: SET_PROP,
      payload: {
        CRFTemplates: {
          selectedTemplates: selectedTemplates,
          options: null
        }
      }
    })
  }
}

export function RemoveTemplate(e) {
  return (dispatch, getState) => {
    var selectedTemplates = _.clone(getState().projectsconfigure.CRFTemplates.selectedTemplates);
    var availableTemplates = getState().projectsconfigure.CRFTemplates.options || [];
    var removed = _.remove(selectedTemplates, (i) => {
      return i.id == e.target.value;
    });
    availableTemplates.push.apply(availableTemplates, removed);
    dispatch({
      type: SET_PROP,
      payload: {
        CRFTemplates: {
          selectedTemplates: selectedTemplates,
          options: availableTemplates
        }
      }
    })
    e.preventDefault();
  }
}

export function FetchUsers(cohortId) {
  return (dispatch, getState) => {
    axios.get(config.api.get_users).then(function (response) {
      if (response.status == config.HTTP_Status.success) {
        var curators = [];
        response.data.results.map(function (item) {
          if (item.groups[0].name == 'curator') {
            curators.push(item)
          }
        });
        var obj = {
          usersEmail: curators,
          assignedCurators: []
        };
        dispatch({
          type: SET_PROP,
          payload: {
            curators: obj
          }
        })
        dispatch(FetchCohorts(cohortId));
      }
    }).catch(function (err) {
      console.log('errr: ', err)
    })
    dispatch(GetCuratorsList());
    dispatch(GetCohortsList());
    dispatch(GetCRFList());    
  }
}

export function GetCuratorsList(search) {
  return (dispatch) => {
    let getUrl = search ? `${config.api.get_curators}?searchParam=${search}` : config.api.get_curators
    axios.get(getUrl)
      .then(function (response) {
        dispatch({
          type: CURATORS_LIST,
          payload: response.data ? response.data.results : []
        })
      })
      .catch(function (errors) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'Error in fetching Curators'
        })
        dispatch(ToggleLoading(false))
      })
  }
}

export function GetCohortsList(search) {
  return (dispatch) => {
    let getUrl = search ? `${config.api.cohort}?searchParam=${search}` : config.api.cohort
    axios.get(getUrl)
      .then(function (response) {
        dispatch({
          type: COHORTS_LIST,
          payload: response.data ? response.data.results : []
        })
      })
      .catch(function (errors) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'Error in fetching Cohorts'
        })
        dispatch(ToggleLoading(false))
      })
  }
}

export function GetCRFList(search) {
  return (dispatch) => {
    let getUrl = search ? `${config.api.get_crf_templates}?searchParam=${search}` : config.api.get_crf_templates
    axios.get(getUrl)
      .then(function (response) {
        dispatch({
          type: CRF_LIST,
          payload: response.data ? response.data.results : []
        })
      })
      .catch(function (errors) {
        dispatch({
          type: TOGGLE_NOTIFICATION,
          payload: true,
          showTime: 3000,
          showType: 'error',
          showMessage: 'Error in fetching CRFs'
        })
        dispatch(ToggleLoading(false))
      })
  }
}

export function FetchTemplates(cohortId) {
  return (dispatch, getState) => {

    axios.get(config.api.get_crf_templates).then(function (response) {
      if (response.status == config.HTTP_Status.success) {
        let CRFTemplates = {
          selectedTemplates: [],
          options: response.data.results
        }
        dispatch({
          type: SET_PROP,
          payload: {
            CRFTemplates: { ...CRFTemplates
            }
          }
        })
        if (cohortId) {
          dispatch(GetCohortById(cohortId));
        } else {
          dispatch(ToggleLoading(false));
        }
      }
    })
  }
}

export function FetchCohorts(cohortId) {
  return (dispatch, getState) => {
    axios.get(config.api.cohort).then(function (response) {
      if (response.status == config.HTTP_Status.success) {
        let cohorts = {
          assignedCohorts: [],
          availableCohorts: response.data.results
        }
        dispatch({
          type: SET_PROP,
          payload: {
            cohorts: { ...cohorts
            }
          }
        })
        dispatch(FetchTemplates(cohortId));
      }
    })
  }
}

export function ClearData() {
  return (dispatch, getState) => {
    if (!getState().projectsconfigure.HideBanner) {
      dispatch({
        type: HIDE_BANNER
      });
    }
    dispatch({
      type: CLEAR_DATA
    });
  }
}


const ACTION_HANDLERS = {
  [CURATORS_LIST]: (state, action) => {
    let curators = _.differenceBy(action.payload, state.curators.assignedCurators, 'email');
    return Object.assign({}, state, {
      curators: Object.assign({}, state.curators, {
        usersEmail: curators
      })
    })
  },
  [COHORTS_LIST]: (state, action) => {
    let cohortsList = _.differenceBy(action.payload, state.cohorts.assignedCohorts, 'id');
    return Object.assign({}, state, {
      cohorts: Object.assign({}, state.cohorts, {
        availableCohorts: cohortsList
      })
    })
  },
  [CRF_LIST]: (state, action) => {
    let crfList = _.differenceBy(action.payload, state.CRFTemplates.selectedTemplates, 'name');
    return Object.assign({}, state, {
      CRFTemplates: Object.assign({}, state.CRFTemplates, {
        options: crfList
      })
    })
  },
  [SET_PROP]: (state, action) => {
    return Object.assign({}, state, { ...action.payload
    })
  },

  [CLEAR_DATA]: (state, action) => {
    let initial = {
      users: [],
      cohort_id: null,
      curators: {
        assignedCurators: [],
        usersEmail: []
      },
      project: {
        name: '',
        description: '',
        validationState: null
      },
      CRFTemplates: {
        options: [],
        selectedTemplates: []
      },
      cohorts: {
        availableCohorts: [],
        assignedCohorts: []
      },
      HideBanner: true,
      currentTemplateRequired: false
    };
    return Object.assign({}, state, { ...initial
    })
  }
}

//reducer
const initialState = {
  users: [],
  cohort_id: null,
  curators: {
    assignedCurators: [],
    usersEmail: []
  },
  cohorts: {
    availableCohorts: [],
    assignedCohorts: []
  },
  project: {
    name: '',
    description: '',
    validationState: null
  },
  CRFTemplates: {
    selectedTemplates: [],
    options: []
  },
  currentTemplateRequired: false,
  HideBanner: true
}
export default function cohortConfigureReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ?
    handler(state, action) :
    state
}

export function dispatchToProps() {
  return {
    handleEvent,
    FetchUsers,
    FetchCohorts,
    AddCurator,
    RemoveCurator,
    AddTemplate,
    RemoveTemplate,
    SaveCohort,
    GetCohortById,
    SelectTemplate,
    handleCheckBoxEvent,
    CancelProject,
    AddCohort,
    RemoveCohort,
    FetchTemplates,
    ToggleLoading,
    ClearData,
    GetCuratorsList,
    GetCohortsList,
    GetCRFList,
    clearInstance
  }
}
