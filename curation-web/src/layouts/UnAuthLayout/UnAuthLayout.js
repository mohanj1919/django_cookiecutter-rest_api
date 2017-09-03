import React from 'react'
import 'font-awesome/scss/font-awesome.scss'


export const UnAuthLayout = ({ children }) => (
    <div className="app unauth-layout">
        <div>
            {children}
        </div>
    </div>
)
export default UnAuthLayout
