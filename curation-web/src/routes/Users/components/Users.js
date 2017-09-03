import React, { PropTypes } from 'react';

function CohortsLayout({ children }) {
  return (
    <div>
      <br />
      {children}
    </div>
  );
}

CohortsLayout.propTypes = {
  children: PropTypes.element
};

export default CohortsLayout;