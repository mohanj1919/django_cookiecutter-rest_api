import React, { PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Button, InputGroup, Modal } from 'react-bootstrap'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Link } from 'react-router'
import './Styles.scss'

function SearchPatients({ children }) {
  return (
    <div>
      <br />
      {children}
    </div>
  );
}

SearchPatients.propTypes = {
  children: PropTypes.element
};

export default SearchPatients
