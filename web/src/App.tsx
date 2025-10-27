import React, { useState } from "react";
import Input from "./components/ui/Input/Input";
import BotaoTexto from "./components/ui/Botao/BotaoTexto";
import { FaUser, FaEnvelope, FaIdCard } from "react-icons/fa";

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Nome: ${nome}\nEmail: ${email}\nCPF: ${cpf}`);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Meu Formulário</h1>
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          value={nome}
          onChange={setNome}
          placeholder="Digite seu nome"
          Icon={FaUser}
        />
        <Input
          label="Email"
          value={email}
          onChange={setEmail}
          tipo="email"
          placeholder="Digite seu email"
          Icon={FaEnvelope}
        />
        <Input
          label="CPF"
          value={cpf}
          onChange={setCpf}
          placeholder="Digite seu CPF"
          Icon={FaIdCard}
          desativado={true}
        />


        <BotaoTexto
          texto="Enviar"
          corFundo="#4CAF50"
          corTexto="#fff"
          tipo="submit"
        />
      </form>
    </div>
  );
}

export default App;
