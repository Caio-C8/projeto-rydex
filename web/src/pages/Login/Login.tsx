import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";

import Card from "../../components/ui/Card/Card";
import Formulario from "../../components/ui/Formulario/Formulario";
import Input from "../../components/ui/Input/Input";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import logoRydex from "../../assets/logo-rydex.png";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await authService.login(email, senha);
      navigate("/");
    } catch (error: any) {
      console.error("Erro no login:", error);
      if (error.response && error.response.data) {
        const msg = error.response.data.message;
        setErro(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao autenticar");
      } else {
        setErro("Falha ao conectar com o servidor.");
      }
    } finally {
      setCarregando(false);
    }
  };

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
            <h1 className="login-title">Bem-vindo de volta!</h1>
            <p className="login-subtitle">Acesse sua conta para gerenciar entregas</p>
          </div>

          <div className="login-card-custom">
            <Card>
              <Formulario onSubmit={handleLogin} titulo="">
                
                <div className="input-group">
                  <Input
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@empresa.com"
                    desativado={carregando}
                  />
                </div>

                <div className="input-group">
                  <Input
                    label="Senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="********"
                    desativado={carregando}
                    Icon={mostrarSenha ? FaEye : FaEyeSlash}
                    iconPosition="right"
                    mostrarIcone={true}
                    onIconClick={() => setMostrarSenha(!mostrarSenha)}
                  />
                </div>

                {/* LINK CENTRALIZADO PELO CSS */}
                <div className="login-links">
                  <Link to="/esqueceu-senha" className="link-esqueceu">
                    Esqueceu sua senha?
                  </Link>
                </div>

                {erro && <div className="mensagem-erro-box shake-animation">{erro}</div>}

                <div className="botao-wrapper">
                  <BotaoTexto
                    type="submit"
                    texto={carregando ? "ENTRANDO..." : "ENTRAR"}
                    corFundo="#FF5722"
                  />
                </div>

                <div className="cadastro-footer">
                  <p>Ainda não tem conta?</p>
                  <Link to="/cadastro" className="link-cadastro">
                    Cadastre sua empresa
                  </Link>
                </div>

              </Formulario>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}