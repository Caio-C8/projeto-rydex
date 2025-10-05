import React from "react";
import "./Botao.css";

// Interface para as propriedades do botão
interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

const Botao = ({ children, variant = "primary", ...props }: BotaoProps) => {
  return (
    <button className={`botao ${variant}`} {...props}>
      {children}
    </button>
  );
};

export default Botao;
