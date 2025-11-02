import React from "react";
import "./Sidebar.css";
import { Home, User, Settings, Clock, Folder } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Logo" />
        <h2>RYDEX</h2>
      </div>

      <div className="sidebar-menu">
        <div className="sidebar-item active">
          <span className="icon"><Home size={22} /></span>
          <span className="text">Início</span>
        </div>

        <div className="sidebar-item">
          <span className="icon"><Clock size={22} /></span>
          <span className="text">Histórico</span>
        </div>

        <div className="sidebar-item">
          <span className="icon"><Folder size={22} /></span>
          <span className="text">Entregas</span>
        </div>

        <div className="sidebar-item">
          <span className="icon"><Settings size={22} /></span>
          <span className="text">Configurações</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item">
          <span className="icon"><User size={22} /></span>
          <span className="text">Perfil</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
