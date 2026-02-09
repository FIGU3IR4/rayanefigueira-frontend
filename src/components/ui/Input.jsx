import React from 'react';

const Input = ({ label, type = "text", value, onChange, placeholder, min, className = "" }) => (
  <div className="mb-4 text-left">
    {label && <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2 ml-1">{label}</label>}
    <input
      type={type} value={value} onChange={onChange} min={min} placeholder={placeholder}
      className={`w-full px-4 py-3 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-600 outline-none transition-all text-white bg-neutral-800 placeholder:text-neutral-600 ${className}`}
    />
  </div>
);
export default Input;