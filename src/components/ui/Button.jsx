import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }) => {
  const baseStyle = "px-4 py-3 sm:py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex justify-center items-center gap-2 active:scale-95 touch-manipulation";
  const variants = {
    primary: "bg-rose-400 text-white hover:bg-rose-500 shadow-md",
    outline: "border-2 border-rose-300 text-rose-400 hover:bg-rose-50",
    danger: "bg-red-50 text-red-500 hover:bg-red-100",
    ghost: "text-gray-500 hover:text-rose-400 bg-transparent"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;