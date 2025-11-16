import React from "react";
import "./Logout.css";
import Card from "../ui/Card/Card";
import { LogOut } from "lucide-react";

const Logout: React.FC = () => {
  return (
    <Card isPointer={true}>
      <div className="card-logout">
        <LogOut />

        <h3>Sair</h3>
      </div>
    </Card>
  );
};

export default Logout;
