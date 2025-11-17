import React from "react";
import "./Header.css";
import Saldo from "../../Saldo/Saldo";
import Logout from "../../Logout/Logout";

interface HeaderProps {
  titulo: string;
  isPerfil: boolean;
}

const Header: React.FC<HeaderProps> = ({ titulo, isPerfil = false }) => {
  return (
    <div className="header-container">
      <h1>{titulo}</h1>

      <div>{isPerfil ? <Logout /> : <Saldo />}</div>
    </div>
  );
};

export default Header;
