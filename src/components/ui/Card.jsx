import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-neutral-900 rounded-2xl border border-neutral-800 p-4 md:p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

export default Card;