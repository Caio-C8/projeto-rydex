import React, { useState } from "react";
import Card from "../../components/ui/Card/Card";
import Formulario from "../../components/ui/Formulario/Formulario";
import Input from "../../components/ui/Input/Input";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import logoRydex from "../../assets/logo-rydex.png";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./CadastroEmpresa.css";

export default function CadastroEmpresa() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  return (
    <div className="container_cadastro_empresa">

      <div className="topo_cadastro_empresa">
        <img src={logoRydex} alt="Logo Rydex" className="logo_cadastro_empresa" />

        <div className="textos_cadastro_empresa">
          <h2 className="titulo_cadastro_empresa">É uma nova empresa?</h2>
          <p className="subtitulo_cadastro_empresa">
            Realize seu cadastro e comece <br /> a solicitar entregas
          </p>
        </div>
      </div>

      <Card isPointer={false}>
        <Formulario onSubmit={(e) => e.preventDefault()} titulo="Dados da empresa">

          <Input label="Nome da empresa:" placeholder="Nome da empresa" />

          <Input
            label="CNPJ:"
            mask="00.000.000/0000-00"
            placeholder="xx.xxx.xxx/xxxx-xx"
          />

          <Input label="E-mail:" placeholder="exemplo@gmail.com" type="email" />

          <div className="linha_dupla_cadastro_empresa">
            <Input
              label="Senha:"
              type={mostrarSenha ? "text" : "password"}
              Icon={mostrarSenha ? Eye : EyeOff}
              iconPosition="right"
              onIconClick={() => setMostrarSenha(!mostrarSenha)}
              placeholder="Sua senha"
            />

            <Input
              label="Confirmar senha:"
              type={mostrarConfirmarSenha ? "text" : "password"}
              Icon={mostrarConfirmarSenha ? Eye : EyeOff}
              iconPosition="right"
              onIconClick={() =>
                setMostrarConfirmarSenha(!mostrarConfirmarSenha)
              }
              placeholder="Sua senha"
            />
          </div>

          <h3 className="titulo_secao_cadastro_empresa">Endereço</h3>

          <Input label="Logradouro:" placeholder="Rua, avenida, etc" />
          <Input label="Bairro:" placeholder="Bairro" />

          <div className="linha_dupla_cadastro_empresa">
            <Input label="Número:" placeholder="Número" />
            <Input label="CEP:" mask="00000-000" placeholder="xxxxx-xxx" />
          </div>

          <Input label="Cidade:" placeholder="Cidade" />

          <div className="botao_cadastro_empresa">
            <BotaoTexto texto="CADASTRAR" type="submit" />
          </div>

          <Link to="/login" className="login_link_cadastro_empresa">
            Já sou cadastrado
          </Link>

        </Formulario>
      </Card>
    </div>
  );
}
