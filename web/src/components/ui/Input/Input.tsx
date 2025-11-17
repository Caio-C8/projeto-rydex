import React from "react";
import { IMaskInput } from "react-imask";
import "./Input.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  desativado?: boolean;
  onIconClick?: () => void;
  iconPosition?: "left" | "right";
  mostrarIcone?: boolean;
  mask?: string;
  onAccept?: (value: string, mask: any) => void; 
};

const Input = ({
  label,
  Icon,
  desativado = false,
  onIconClick,
  iconPosition = "left",
  mostrarIcone = true,
  mask,
  onAccept, 
  ...props
}: InputProps) => {
  const inputClasses = `input ${Icon ? `with-icon ${iconPosition}` : ""}`;

  
  const { value, onChange, ...restOfProps } = props; 

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

        {mask ? (
          <IMaskInput
            mask={mask}
            disabled={desativado}
            onAccept={onAccept}
            unmask={true}
            className={inputClasses}
            value={value} 
            onChange={onChange}
            {...(restOfProps as any)}
          />
        ) : (
          <input
            className={inputClasses}
            disabled={desativado}
            {...props}
          />
        )}
      </div>
    </div>
  );
};

export default Input;