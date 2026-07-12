import React from 'react';

const Input = ({ label, className = '', containerClassName = '', type = 'text', ...props }) => {
  return (
    <div className={`flex items-start flex-col w-full ${containerClassName}`}>
      {label && <label className="label">{label}</label>}
      <input type={type} className={`input ${className}`} {...props} />
    </div>
  );
};

export default Input;
