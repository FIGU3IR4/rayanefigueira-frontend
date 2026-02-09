import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }) => {
  const baseStyle = "px-4 py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2 active:scale-95";
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200 shadow-lg", // Botão branco com texto preto (Chique)
    outline: "border-2 border-neutral-700 text-white hover:bg-neutral-800",
    danger: "bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50",
    ghost: "text-neutral-500 hover:text-white bg-transparent"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;