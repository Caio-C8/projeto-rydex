import React from "react";
import "./Logout.css";
import Card from "../ui/Card/Card";
import { LogOut } from "lucide-react";
import { authService } from "../../services/authService";

const Logout: React.FC = () => {
  
  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div onClick={handleLogout} role="button" style={{ cursor: 'pointer', width: '100%' }}>
      <Card isPointer={true}>
        <div className="card-logout">
          <LogOut color="#D32F2F" />
          <h3 style={{ color: '#D32F2F' }}>Sair</h3>
        </div>
      </Card>
    </div>
  );
};

export default Logout;