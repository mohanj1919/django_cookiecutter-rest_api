import React from 'react';
import expect from 'expect'
import sinon from 'sinon';
import { default as ManageCaseReportForm } from '../../../../src/routes/CaseReportForm/routes/ManageCaseReportForm/components/ManageCaseReportForm'
import { mount } from 'enzyme';


describe('ChartReview component', () => {
    beforeEach(function () {
        localStorage.logged_user_role = 'admin'
    });
})