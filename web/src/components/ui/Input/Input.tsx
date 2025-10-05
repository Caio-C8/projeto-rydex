import React from "react";
import "./Input.css";

// Interface para as propriedades do Input
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = (props: InputProps) => {
  return <input className="input" {...props} />;
};

export default Input;
