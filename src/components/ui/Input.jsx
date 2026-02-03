import React from 'react';

const Input = ({ label, type = "text", value, onChange, placeholder, min }) => (
  <div className="mb-4 text-left">
    {label && (
      <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-300 outline-none transition-all text-gray-700 bg-rose-50/30 placeholder:text-gray-300"
    />
  </div>
);

export default Input;