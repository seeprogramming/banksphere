import React from 'react';
import PropTypes from 'prop-types';

export const Header = ({ children, className, ...props }) => {
    return (
        <nav className='navbar bg-body-tertiary'>
            <div className='container-fluid'>
                <a className='navbar-brand'>{props.application_name}</a>
                <div className='d-flex'>Hi {props.profile_name}</div>
            </div>
        </nav>
    );
};

Header.propTypes = {
    application_name: PropTypes.string.isRequired,
    profile_name: PropTypes.string.isRequired,
    className: PropTypes.string,
};
