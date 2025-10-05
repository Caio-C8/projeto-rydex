import React from "react";
import "./Formulario.css";

interface FormularioProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  titulo?: string;
}

const Formulario = ({ onSubmit, children, titulo }: FormularioProps) => {
  return (
    <form className="form" onSubmit={onSubmit}>
      {titulo && <h3>{titulo}</h3>}
      {children}
    </form>
  );
};

export default Formulario;
