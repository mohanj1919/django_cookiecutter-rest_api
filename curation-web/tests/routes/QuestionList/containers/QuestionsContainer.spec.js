import React from 'react'
import QuestionsContainer, { mapDispatchToProps, mapStateToProps } from '../../../../src/routes/QuestionList/containers/QuestionsContainer'
import expect from 'expect'

describe('Questions List container', () => {
  beforeEach(function () {
        localStorage.logged_user_role = 'admin'
    });

})