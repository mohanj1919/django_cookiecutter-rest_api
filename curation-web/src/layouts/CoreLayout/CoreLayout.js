import React from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Footer from '../../components/Footer'
import Banner from '../../components/Banner'
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/scss/font-awesome.scss'
import './CoreLayout.scss'
import '../../styles/core.scss'

export const CoreLayout = (props) => (
  <div>
    <Header logOut={props.Logout} userEmail={props.userEmail} role={props.role} userFirstName ={props.userFirstName} router={props.router}/>
    {props.isloading ? <div className='loading'></div> : null}
    {props.showBanner ? <Banner type={props.showType} time={props.showTime}
      successCb={props.successCb}
      cancelCb={props.HideBanner}
      message={props.showMessage}
      bannerHide={props.HideBanner}
      confirmText={props.confirmText}
      messageTitle={props.messageTitle} /> : null}
    <div className='app-body'>
      <div>
        {props.children}
      </div>
    </div>
    <Footer/>
  </div>
)

export default CoreLayout
