import React from "react";
import "./Input.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  desativado?: boolean;
  onIconClick?: () => void;
  iconPosition?: "left" | "right";
  mostrarIcone?: boolean;
};

const Input = ({
  label,
  Icon,
  desativado = false,
  onIconClick,
  iconPosition = "left",
  mostrarIcone = true,
  ...props
}: InputProps) => {
  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && mostrarIcone && (
          <Icon
            className={`input-icon ${iconPosition}`}
            onClick={onIconClick}
          />
        )}
        <input
          className={`input ${Icon ? `with-icon ${iconPosition}` : ""}`}
          {...props}
          disabled={desativado}
        />
      </div>
    </div>
  );
};

export default Input;
