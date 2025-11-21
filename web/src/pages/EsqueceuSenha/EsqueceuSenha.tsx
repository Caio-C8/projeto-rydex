import React, { useState } from "react";
import { Link } from "react-router-dom"; // Usei Link em vez de <a> para SPA
import Card from "../../components/ui/Card/Card";
import Formulario from "../../components/ui/Formulario/Formulario";
import Input from "../../components/ui/Input/Input";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import logoRydex from "../../assets/logo-rydex.png";
import "./EsqueceuSenha.css"; // Vamos atualizar este CSS

import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

const EsqueceuSenha: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de recuperação aqui
  };

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  return (
    <div className="login-split-container">
      
      {/* LADO ESQUERDO: LOGO */}
      <div className="login-left">
        <div className="logo-box anime-fade-in">
          <img src={logoRydex} alt="Logo Rydex" className="login-logo-img" />
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="login-right">
        <div className="login-form-wrapper anime-slide-up">
          
          <div className="login-header">
            <h1 className="login-title">Troque sua senha</h1>
            <p className="login-subtitle">Defina uma nova senha segura</p>
          </div>

          <div className="login-card-custom">
            <Card>
              <Formulario onSubmit={handleSubmit} titulo="">
                
                <div className="input-group">
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="exemplo@email.com"
                    // Sem ícone para manter o padrão clean do login
                  />
                </div>

                <div className="input-group">
                  <Input
                    label="Nova Senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Sua nova senha"
                    Icon={mostrarSenha ? FaEye : FaEyeSlash}
                    iconPosition="right"
                    mostrarIcone={true}
                    onIconClick={() => setMostrarSenha(!mostrarSenha)}
                  />
                </div>

                <div className="input-group">
                  <Input
                    label="Confirmar Senha"
                    type={mostrarConfirmar ? "text" : "password"}
                    placeholder="Repita a senha"
                    Icon={mostrarConfirmar ? FaEye : FaEyeSlash}
                    iconPosition="right"
                    mostrarIcone={true}
                    onIconClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  />
                </div>

                <div className="botao-wrapper" style={{ marginTop: '25px' }}>
                  <BotaoTexto texto="ALTERAR SENHA" type="submit" corFundo="#FF5722" />
                </div>

                <div className="login-links">
                  <Link to="/login" className="link-esqueceu">
                    ← Voltar ao login
                  </Link>
                </div>

              </Formulario>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EsqueceuSenha;