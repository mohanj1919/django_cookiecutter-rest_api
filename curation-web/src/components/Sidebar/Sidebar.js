import React, { Component } from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink
} from 'react-router-dom'
import '../../../scss/style.scss'
class Sidebar extends Component {

  handleClick(e) {
    e.preventDefault();
    e.target.parentElement.classList.toggle('open');
  }

  activeRoute(routeName) {
    return  'nav-item nav-dropdown open';
    // return this.props.location.pathname.indexOf(routeName) > -1 ? 'nav-item nav-dropdown open' : 'nav-item nav-dropdown';
  }

  // secondLevelActive(routeName) {
  //   return this.props.location.pathname.indexOf(routeName) > -1 ? "nav nav-second-level collapse in" : "nav nav-second-level collapse";
  // }

  render() {
    return (
      <div id="sidebar-wrapper">
        <nav id="spy">
            <ul className="sidebar-nav nav">
                <li className="sidebar-brand">
                    <a href="#home"><span className="fa fa-home solo">Home</span></a>
                </li>
                <li>
                    <a href="#anch1">
                        <span>Anchor 1</span>
                    </a>
                </li>
                <li>
                    <a href="#anch2">
                        <span>Anchor 2</span>
                    </a>
                </li>
                <li>
                    <a href="#anch3">
                        <span>Anchor 3</span>
                    </a>
                </li>
                <li>
                    <a href="#anch4">
                        <span>Anchor 4</span>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
    )
  }
}

export default Sidebar;
