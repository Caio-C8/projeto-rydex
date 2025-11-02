import React from "react";
import "./BotaoTexto.css";

type BotaoTextoProps = {
  texto: string;
  corFundo?: string;
  corTexto?: string;
  corTextoHover?: string;
  corBorda?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export default function BotaoTexto({
  texto,
  corFundo = "#FF5722",
  corTexto = "#2C2C2C",
  corTextoHover = "#FFFFFF",
  corBorda = "#FF5722", 
  type = "button",
  onClick
}: BotaoTextoProps) {

  return (
    <button
      className="botao"
      onClick={onClick}
      style={{
        "--cor-fundo": corFundo,
        "--cor-texto": corTexto,
        "--cor-texto-hover": corTextoHover,
        "--cor-borda": corBorda,
      } as React.CSSProperties}
    >
      {texto}
    </button>
  );
}
