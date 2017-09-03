import React from 'react'
import { Navbar, Nav, NavDropdown, MenuItem } from 'react-bootstrap';
import logo from '../../../../public/assets/images/logo.png';
import './style.scss';
export class PageNotFound extends React.Component {
    render() {
        return (
            <div>
                <Navbar className='brand-nav'>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <img src={logo} className='brand-logo'/>
                        </Navbar.Brand>
                    </Navbar.Header>
                </Navbar>
                <h3 className='text-info error-message'>You're looking for something which is not there</h3>
            </div>
        )
    }
}
export default PageNotFound