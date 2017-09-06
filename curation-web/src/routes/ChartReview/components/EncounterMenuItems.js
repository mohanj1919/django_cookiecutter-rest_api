import React from 'react'
import ShowDetails from './ShowDetails'
import { PanelGroup, Panel, Accordion, Button, ControlLabel } from 'react-bootstrap'
import Collapsible from 'react-collapsible'
import _ from 'lodash'

const EncounterMenuItems = (props) => {
  let comps = []
  if (props && props.encountersData) {
    let encounters = props.encountersData.sort(function (a, b) {
      return new Date(b.start) - new Date(a.start)
    })
    const uniqueYears = [...new Set(encounters.map(item => new Date(item.start).toLocaleDateString()))]
    var capitalize = (word) => {
      if (word) {
        word = word.split('_').join(' ')
        return word.charAt(0).toUpperCase() + word.slice(1)
      } else
        return ''
    }

    uniqueYears.map((uy, year) => {
      let childComp = []
      props.encountersData.map((ed, i) => {
        if (new Date(ed.start).toLocaleDateString() == uy) {
          childComp.push(
            <div>
              <Panel header={<a><label>Encounter {ed.start ? new Date(ed.start).toLocaleDateString() : null}</label>
                <span className='collapse-show-links'><a onClick={() => props.TogglingCollapse(ed.id, 'show') } className='enable-collapse-link'> Show all </a>
                  |<a onClick={() => props.TogglingCollapse(ed.id, 'collapse') } className='enable-collapse-link'> Collapse all </a></span></a>}
                eventKey={i} className='individual-encounter-div' key={'encounter' + i}>
                {Object.keys(ed) && Object.keys(ed).length > 0 ? Object.keys(ed).map((section, index) => (
                  _.isArray(ed[section]) ? (
                    <Collapsible key={section + index} trigger={<label>{capitalize(section) }</label>} open={ed.collapse == 'show' ? true : ed.collapse == 'collapse' ? false : true}>
                      {ed[section] && ed[section].length > 0 ? ed[section].map((sec, ind) => (
                        <div className='row individual-sec'>
                          {Object.keys(sec).map((secdetails, secindex) => (
                            <ShowDetails text={secdetails} value={sec[secdetails] ? sec[secdetails].toString() : 'N/A'} />
                          )) }
                        </div>
                      )) : <h4 className='no-encounters-info'>No {capitalize(section) } data found</h4> }
                    </Collapsible>
                  ) : null
                )) : null }
              </Panel>
            </div>
          )
        }
      })
      comps.push(
        <div id={uy} className='encounter-div'>
          {childComp}
        </div>
      )
    })
  }

  return (
    <div>{comps}</div>
  )
}

export default EncounterMenuItems