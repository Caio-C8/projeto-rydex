import React from "react";
import "./SideBar.css";
import logoRydex from "../../../assets/logo-rydex.png";
import { NavLink } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMoneyBill,
  faClockRotateLeft,
  faBox,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

interface SideBarProps {
  isExpandido: boolean;
  setIsExpandido: (isExpandido: boolean) => void;
}

const SideBar: React.FC<SideBarProps> = ({ isExpandido, setIsExpandido }) => {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `icon ${isActive ? "ativado" : ""}`;
  };

  return (
    <div
      className={`sidebar ${isExpandido ? "expandido" : ""}`}
      onMouseEnter={() => setIsExpandido(true)}
      onMouseLeave={() => setIsExpandido(false)}
    >
      <NavLink to="/" className="sidebar-logo">
        <img src={logoRydex} alt="Logo Rydex" />
      </NavLink>

      <div className="sidebar-icons">
        <NavLink to="/" className={getNavLinkClass}>
          <FontAwesomeIcon icon={faHouse} />
          {isExpandido && <span className="icon-texto">Início</span>}
        </NavLink>

        <NavLink to="/adicionar-saldo" className={getNavLinkClass}>
          <FontAwesomeIcon icon={faMoneyBill} />
          {isExpandido && <span className="icon-texto">Carteira</span>}
        </NavLink>

        <NavLink to="/historico" className={getNavLinkClass}>
          <FontAwesomeIcon icon={faClockRotateLeft} />
          {isExpandido && <span className="icon-texto">Históico</span>}
        </NavLink>

        <NavLink to="/solicitar-entrega" className={getNavLinkClass}>
          <FontAwesomeIcon icon={faBox} />
          {isExpandido && <span className="icon-texto">Entregas</span>}
        </NavLink>

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `${getNavLinkClass({ isActive })} icon-bottom`
          }
        >
          <FontAwesomeIcon icon={faUser} />
          {isExpandido && <span className="icon-texto">Perfil</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default SideBar;
