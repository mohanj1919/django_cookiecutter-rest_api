import React from 'react'

const ShowDetails = (props) => {
    let nameLabel = props.text.split('_').join(' ')
    nameLabel = nameLabel.charAt(0).toUpperCase() + nameLabel.slice(1)
    return (
        <div className='col-lg-6 col-md-6 encounter-label'><label>{nameLabel} :</label><span className='details-data'>{props.value}</span></div>
    )
}
export default ShowDetails