import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  // variants: primary, outline, secondary, icon
  let variantClass = '';
  if (variant === 'primary') variantClass = 'btn-primary';
  if (variant === 'outline') variantClass = 'btn-outline';
  
  const finalClass = variant === 'icon' 
    ? `btn-icon ${className}` 
    : `btn ${variantClass} ${className}`;

  return (
    <button className={finalClass.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;
