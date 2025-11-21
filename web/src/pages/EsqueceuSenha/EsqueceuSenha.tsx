import React from "react";
import Card from "../../components/ui/Card/Card";
import Formulario from "../../components/ui/Formulario/Formulario";
import Input from "../../components/ui/Input/Input";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import logoRydex from "../../assets/logo-rydex.png";
import "./EsqueceuSenha.css";

import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

const EsqueceuSenha: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = React.useState(false);

  return (
    <div className="container">
      <div className="left">
        <img src={logoRydex} alt="Logo Rydex" className="esq-logo" />
      </div>

      <div className="right">
        <h1 className="title">Troque sua senha</h1>
        <p className="subtitle">E faça o login novamente</p>

        <Card isPointer={false}>
          <Formulario onSubmit={handleSubmit} titulo="">
            <Input
              label="E-mail"
              type="email"
              Icon={FaEnvelope}
              placeholder="exemplo@email.com"
            />

            <Input
              label="Senha"
              type={mostrarSenha ? "text" : "password"}
              Icon={mostrarSenha ? FaEye : FaEyeSlash}
              iconPosition="right"
              mostrarIcone={true}
              onIconClick={() => setMostrarSenha(!mostrarSenha)}
              placeholder="Sua senha"
            />

            <Input
              label="Confirmar senha"
              type={mostrarConfirmar ? "text" : "password"}
              Icon={mostrarConfirmar ? FaEye : FaEyeSlash}
              iconPosition="right"
              mostrarIcone={true}
              onIconClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              placeholder="Confirme sua senha"
            />


            <div className="botao-wrapper">
              <BotaoTexto texto="ALTERAR" type="submit" />
            </div>


            <a href="/login" className="returnLogin">
              voltar ao login
            </a>
          </Formulario>
        </Card>
      </div>
    </div>
  );
};

export default EsqueceuSenha;