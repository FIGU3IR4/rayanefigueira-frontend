import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-rose-100 p-4 md:p-6 ${className}`}>
    {children}
  </div>
);

export default Card;