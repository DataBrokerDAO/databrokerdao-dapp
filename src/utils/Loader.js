import React from 'react';
import '../styles/loader.css';

const Loader = ({ isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="spinner">
        <div className="double-bounce1" />
        <div className="double-bounce2" />
      </div>
    );
  } else if (error) {
    console.log(error);
    return <div>Sorry, unable to load the page...</div>;
  } else {
    return null;
  }
};

export default Loader;
