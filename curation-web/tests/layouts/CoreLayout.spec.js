import React from 'react'
import expect from 'expect'
import localStorage from 'mock-local-storage'
import {
  shallow,
  mount
} from 'enzyme'
import CoreLayout from '../../src/layouts/CoreLayout/CoreLayout'

const wrapper = mount( <CoreLayout router={[]} userFirstName='Ganesh' userEmail={'sivaganesh.bhagi@gmail.com'} /> )

describe('the header component', () => {
    beforeEach(function() {
      localStorage.logged_user_role = 'admin'
    });

  it('renders user name section', () => {
    expect(wrapper.find('#basic-nav-dropdown').length == 1).toEqual(true)
  })

  it('renders user name as given', () => {
    expect(wrapper.find('#basic-nav-dropdown').text().trim().toLocaleLowerCase()).toEqual('hi, ganesh')
  })
})
