import React, { useState } from "react";
import "./BotaoTexto.css";

type BotaoTextoProps = {
  texto: string;
  corFundo?: string; // #4CAF50; #FFC107; #E53935; #FF5722;
  corTexto?: string;
  corTextoHover?: string;
  onClick?: () => void;
  tipo?: "button" | "submit" | "reset";
};

export default function BotaoTexto({
  texto,
  corFundo = "#FF5722",
  corTexto = "#2C2C2C",
  corTextoHover = "#FFFFFF",
  onClick,
  tipo = "button"
}: BotaoTextoProps) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
    if (onClick) onClick();
  };

  return (
    <button
      type={tipo}
      className="botao"
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: active ? "transparent" : corFundo,
        color: hover ? corTextoHover : corTexto,
        border: `2px solid ${active ? corFundo : "transparent"}`, 
      }}
    >
      {texto}
    </button>
  );
}
