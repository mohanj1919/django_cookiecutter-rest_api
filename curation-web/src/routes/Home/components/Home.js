import React from 'react'

import { Button } from 'react-bootstrap';
import CuratorProjects from '../routes/CuratorProjects/components/CuratorProjects'



export default class Home extends React.Component {
    componentDidMount() {
        this.props.PasswordExpirationCheck()
        if (this.props.role == 'curator') this.props.GetCuratorProjects()
    }
    render() {
        return (
            <div>
                {this.props.role == 'admin' ?
                    <div className='admin-home-div' >
                        <h4 className='text-info'>Loading...</h4>
                        {this.props.router.push('/projects')}
                    </div> :
                    <div className= 'curator-home-div' >
                        <div className='container' style={{paddingTop:'10px'}}>
                            <CuratorProjects projectsData={this.props.projectsData}
                                SearchProject={this.props.SearchProject}
                                PageChanged={this.props.PageChanged}
                                page={this.props.page}
                                SortChange={this.props.SortChange}
                                totalCount={this.props.totalCount}
                                router={this.props.router}
                                />
                        </div>
                    </div>
                }
            </div>
        )
    }
}
