import React from "react";
import "./Card.css";

interface CardProps {
  imagem?: string;
  titulo: string;
  descricao: string;
  children?: React.ReactNode; // para adicionar botões, links etc.
}

const Card = ({ imagem, titulo, descricao, children }: CardProps) => {
  return (
    <div className="card">
      {imagem && <img src={imagem} alt={titulo} className="card-img" />}
      <div className="card-content">
        <h3>{titulo}</h3>
        <p>{descricao}</p>
        {children}
      </div>
    </div>
  );
};

export default Card;

