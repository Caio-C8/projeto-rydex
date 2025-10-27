import React, { useState } from "react";
import Input from "../Input/Input";
import BotaoTexto from "../Botao/BotaoTexto";

export default function Formulario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Nome: ${nome}\nEmail: ${email}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nome" value={nome} onChange={setNome} placeholder="Digite seu nome" />
      <Input label="Email" value={email} onChange={setEmail} tipo="email" placeholder="Digite seu email" />
      <BotaoTexto
        texto="Enviar"
        corFundo="#4CAF50"
        corTexto="#fff"
        tipo="submit"
      />
    </form>
  );
}
