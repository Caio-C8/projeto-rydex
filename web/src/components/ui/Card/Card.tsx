import React from "react";
import "./Card.css";

interface CardProps {
  children: React.ReactNode;
  isPointer: boolean;
}

const Card: React.FC<CardProps> = ({ children, isPointer = false }) => {
  return <div className={`card ${isPointer ? "pointer" : ""}`}>{children}</div>;
};

export default Card;
