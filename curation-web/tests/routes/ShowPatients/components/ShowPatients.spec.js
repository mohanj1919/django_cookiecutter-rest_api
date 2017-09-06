import React from 'react'
// import { default as ShowPatients } from '../../../../src/routes/SearchPatient/routes/ShowPatients/components/ShowPatients'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'


/*describe('ShowPatients component', () => {

    let patients = [{
        cohort:{id: 1, name: "Back Pain", description: null},
        project:{id: 20, name: "test112", description: "test112"},
        curator:{id: 10, email: "lohith.dhanakonda+curator@ggktech.com", mfa_type: "google", phone_number: null}
    }]
    let searchParams = {status : 'fvbf'};
    let a = {}
    let b = {}
    let c = {}
    const wrapper = mount(<ShowPatients
    searchParams={searchParams}
    pageNumber={1}
    availableProjects={a}
    availableCohorts={b}
    availablePatients={c}
    patients={patients}
    totalCount={1}

    FetchPatientData={function () { }}
    ShowPatientDetails={function () { }}
    ExtractCRFs={function () { }}
    Unassign={function () { }}
    PageChange={function () { }}
    SortChange={function () { }}
    GetProjects={function () { }}
    FilterPatients={function () { }}
    GetCohorts={function () { }}
    ChangeStatus={function () { }}
    />)

    it('should render search boxes', () => {
        expect(wrapper.find('.well').length).toEqual(1)
    })
    
    
})*/