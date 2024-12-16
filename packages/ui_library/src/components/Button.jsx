import React from 'react';

export const Button = ({ children, className, ...props }) => {
    return (
        <button className={`btn btn-sm btn-primary ${className}`} {...props}>
            {children}
        </button>
    );
};
