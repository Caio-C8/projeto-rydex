import React, { useState } from "react";
import Input from "./components/ui/Input/Input";
import BotaoTexto from "./components/ui/Botao/BotaoTexto";
import { FaUser, FaEnvelope, FaIdCard } from "react-icons/fa";

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const [mostrarIconeNome, setMostrarIconeNome] = useState(true);
  const [ativoNome, setAtivoNome] = useState(false);

  const [mostrarIconeEmail, setMostrarIconeEmail] = useState(true);
  const [ativoEmail, setAtivoEmail] = useState(false);

  const [mostrarIconeCpf, setMostrarIconeCpf] = useState(true);
  const [ativoCpf, setAtivoCpf] = useState(false);

  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Nome: ${nome}\nEmail: ${email}\nCPF: ${cpf}`);

    setMostrarIconeNome(true);
    setAtivoNome(false);

    setMostrarIconeEmail(true);
    setAtivoEmail(false);

    setMostrarIconeCpf(true);
    setAtivoCpf(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Meu Formulário</h1>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite seu nome"
          Icon={FaUser}
          iconPosition="right"
          mostrarIcone={mostrarIconeNome}
          desativado={!ativoNome}
          onIconClick={() => {
            setAtivoNome(true);
            setMostrarIconeNome(false);
          }}
        />
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu email"
          Icon={FaEnvelope}
          iconPosition="right"
          mostrarIcone={mostrarIconeEmail}
          desativado={!ativoEmail}
          onIconClick={() => {
            setAtivoEmail(true);
            setMostrarIconeEmail(false);
          }}
        />
        <Input
          label="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="Digite seu CPF"
          Icon={FaIdCard}
          iconPosition="right"
          mostrarIcone={mostrarIconeCpf}
          desativado={!ativoCpf}
          onIconClick={() => {
            setAtivoCpf(true);
            setMostrarIconeCpf(false);
          }}
        />
        <Input
          label="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
          Icon={FaIdCard}
          iconPosition="right"
          desativado={false}
          mostrarIcone={true}
          type={mostrarSenha ? "text" : "password"}
          onIconClick={() => setMostrarSenha(!mostrarSenha)}
        />

        <BotaoTexto texto="Enviar" type="submit" />
      </form>
    </div>
  );
}

export default App;
