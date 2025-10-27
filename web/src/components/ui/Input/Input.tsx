import React, { useState } from "react";
import "./Input.css";

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tipo?: string;
  desativado?: boolean;
  Icon?: React.ComponentType<{ className?: string }>;
};

export default function Input({
  label,
  value,
  onChange,
  placeholder = "",
  tipo = "text",
  desativado = false,
  Icon,
}: InputProps) {
  const [ativo, setAtivo] = useState(!desativado);

  const alternarAtivo = () => {
    setAtivo(!ativo);
  };

  return (
    <div className="input-container">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type={tipo}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={!ativo}
        />
        {Icon && (
          <Icon
            className={`input-icon ${ativo ? "ativo" : "desativado"}`}
            onClick={alternarAtivo}
          />
        )}
      </div>
    </div>
  );
}
