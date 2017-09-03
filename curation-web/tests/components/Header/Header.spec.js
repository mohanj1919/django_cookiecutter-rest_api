import React from 'react'
import { default as Header } from '../../../src/components/Header/Header'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import localStorage from 'mock-local-storage'
import expect from 'expect'

describe('(Component) Header', () => {
      beforeEach(function() {
      localStorage.logged_user_role = 'admin'
    });
const wrapper = mount( <Header router={[]}/>)

    it('Getting Logo', () => {
        const logo = wrapper.find('img')
        expect(logo).toExist
        expect(logo.find('.brand-logo')).toExist
    })
    it('Renders a NavDropdown', () => {
        const NavDropdown = wrapper.find('NavDropdown')
        expect(NavDropdown).toExist
    })
})