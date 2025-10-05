import { useState, useEffect } from "react";
import "./TesteApi.css";

import {
  useGetTodosUsuarios,
  useGetUsuarioPorId,
  useCriarUsuario,
  useAtualizarUsuario,
  useDeletarUsuario,
} from "../../hooks/useUsuarios";

import Botao from "../../components/ui/Botao/Botao";
import Input from "../../components/ui/Input/Input";
import Resultado from "../../components/Resultado/Resultado";
import Formulario from "../../components/ui/Formulario/Formulario";
import NavBar from "../../components/layout/NavBar/NavBar";

type Tab = "todos" | "buscar" | "criar" | "atualizar" | "deletar";

function TesteApi() {
  const [activeTab, setActiveTab] = useState<Tab>("todos");

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const todosHook = useGetTodosUsuarios();
  const buscaHook = useGetUsuarioPorId();
  const criaHook = useCriarUsuario();
  const atualizaHook = useAtualizarUsuario();
  const deletaHook = useDeletarUsuario();

  useEffect(() => {
    if (activeTab === "todos") {
      todosHook.buscarTodos();
    }
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (activeTab) {
      case "buscar":
        buscaHook.buscarPorId(Number(id));
        break;
      case "criar":
        criaHook.criar({ nome, email });
        break;
      case "atualizar":
        const dadosParaAtualizar = {
          ...(nome && { nome }),
          ...(email && { email }),
        };
        atualizaHook.atualizar(Number(id), dadosParaAtualizar);
        break;
      case "deletar":
        deletaHook.deletar(Number(id));
        break;
    }
  };

  const getResultadoProps = () => {
    if (activeTab === "todos") {
      return {
        dados: todosHook.usuarios,
        loading: todosHook.loading,
        mensagem: todosHook.mensagemSucesso,
        erros: todosHook.erro,
      };
    } else if (activeTab === "buscar") {
      return {
        dados: buscaHook.usuario,
        loading: buscaHook.loading,
        mensagem: buscaHook.mensagemSucesso,
        erros: buscaHook.erro,
      };
    } else if (activeTab === "criar") {
      return {
        dados: criaHook.usuario,
        loading: criaHook.loading,
        mensagem: criaHook.mensagemSucesso,
        erros: criaHook.erro,
      };
    } else if (activeTab === "atualizar") {
      return {
        dados: atualizaHook.usuario,
        loading: atualizaHook.loading,
        mensagem: atualizaHook.mensagemSucesso,
        erros: atualizaHook.erro,
      };
    } else if (activeTab === "deletar") {
      return {
        dados: deletaHook.usuario,
        loading: deletaHook.loading,
        mensagem: deletaHook.mensagemSucesso,
        erros: deletaHook.erro,
      };
    } else {
      return { dados: null, loading: false, mensagem: null, erros: null };
    }
  };

  const isLoading =
    todosHook.loading ||
    buscaHook.loading ||
    criaHook.loading ||
    atualizaHook.loading ||
    deletaHook.loading;

  const renderFormulario = () => {
    if (activeTab === "buscar") {
      return (
        <Formulario onSubmit={handleSubmit} titulo="Buscar por ID">
          <Input
            type="number"
            placeholder="ID do Usuário"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <Botao type="submit" disabled={isLoading}>
            Buscar
          </Botao>
        </Formulario>
      );
    } else if (activeTab === "criar") {
      return (
        <Formulario onSubmit={handleSubmit} titulo="Criar Usuário">
          <Input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Botao type="submit" disabled={isLoading}>
            Criar
          </Botao>
        </Formulario>
      );
    } else if (activeTab === "atualizar") {
      return (
        <Formulario onSubmit={handleSubmit} titulo="Atualizar Usuário">
          <Input
            type="number"
            placeholder="ID do Usuário"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Novo Nome (opcional)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Novo Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Botao type="submit" disabled={isLoading}>
            Atualizar
          </Botao>
        </Formulario>
      );
    } else if (activeTab === "deletar") {
      return (
        <Formulario onSubmit={handleSubmit} titulo="Deletar Usuário">
          <Input
            type="number"
            placeholder="ID do Usuário"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <Botao type="submit" variant="danger" disabled={isLoading}>
            Deletar
          </Botao>
        </Formulario>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="container">
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="mainContent">
        <div className="formSection">{renderFormulario()}</div>
        <div className="resultSection">
          <Resultado {...getResultadoProps()} />
        </div>
      </main>
    </div>
  );
}

export default TesteApi;
