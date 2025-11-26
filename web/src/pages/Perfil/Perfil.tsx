import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaPencilAlt,
  FaCheck,
  FaUserCircle,
  FaMapMarkedAlt,
  FaTimes,
  FaLock,
} from "react-icons/fa";

import { empresasService } from "../../services/empresasService";
import type { DadosAlteracaoEmpresa } from "../../services/empresasService";
import { ModalEndereco } from "../../components/ModalEndereco/ModalEndereco";
import Card from "../../components/ui/Card/Card";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import "./Perfil.css";
import { formatarCnpj } from "../../utils/formatar-cnpj";
import { formatarCep } from "../../utils/formatar-cep";

// --- Componente Auxiliar: Input Editável (Com Suporte a Password) ---
interface InputEditavelProps {
  label: string;
  name: string;
  value: string | number;
  valorOriginal: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  podeEditar?: boolean;
  type?: string;
  placeholder?: string;
}

const InputEditavel = ({
  label,
  name,
  value,
  valorOriginal,
  onChange,
  podeEditar = true,
  type = "text",
  placeholder,
}: InputEditavelProps) => {
  const [editando, setEditando] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const estaModificado = String(value) !== String(valorOriginal);

  const toggleEdit = () => {
    if (!podeEditar) return;
    setEditando(!editando);

    if (!editando) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="input-editavel-wrapper">
      <label className="label-perfil">
        {label}
        {estaModificado && <span className="tag-alterado"> (Alterado)</span>}
      </label>

      <div className="input-container-icon">
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={!editando}
          placeholder={placeholder}
          className={`input-perfil ${
            editando || estaModificado ? "editando" : ""
          }`}
        />

        {podeEditar && (
          <button
            type="button"
            className={`btn-editar-campo ${editando ? "ativo" : ""}`}
            onClick={toggleEdit}
            title={editando ? "Confirmar edição" : "Editar este campo"}
          >
            {editando ? <FaCheck /> : <FaPencilAlt />}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Página Principal de Perfil ---
export function Perfil() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estado inicial padrão
  const estadoInicial = {
    id: 0,
    nome_empresa: "",
    email: "",
    cnpj: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    saldo: 0,
    senha: "",
    confirmarSenha: "",
  };

  const [form, setForm] = useState(estadoInicial);
  const [dadosOriginais, setDadosOriginais] = useState(estadoInicial);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const dados = await empresasService.buscarDadosEmpresa();

      if (!dados || dados.id === undefined) {
        toast.error("Falha ao carregar dados. Empresa não encontrada.");
        setErro("Empresa não encontrada");
        setLoading(false);
        return;
      }

      const dadosFormatados = {
        id: dados.id || 0,
        nome_empresa: dados.nome_empresa || "",
        email: dados.email || "",
        cnpj: dados.cnpj || "",
        cep: dados.cep || "",
        logradouro: dados.logradouro || "",
        numero: dados.numero || "",
        bairro: dados.bairro || "",
        cidade: dados.cidade || "",
        saldo: dados.saldo || 0,
        senha: "",
        confirmarSenha: "",
      };

      setForm(dadosFormatados);
      setDadosOriginais(dadosFormatados);
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);

      // Mensagens de erro mais específicas
      let mensagemErro = "Erro ao carregar dados. Tente novamente.";

      if (error.response) {
        if (error.response.status === 401) {
          mensagemErro = "Sessão expirada. Faça login novamente.";
        } else if (error.response.status === 404) {
          mensagemErro = "Empresa não encontrada.";
        } else {
          mensagemErro = error.response.data?.message || "Erro no servidor.";
        }
      } else if (error.request) {
        mensagemErro = "Erro de conexão. Verifique sua internet.";
      }

      toast.error(mensagemErro);
      setErro(mensagemErro);

      // ✅ Define estado padrão em caso de erro
      setForm(estadoInicial);
      setDadosOriginais(estadoInicial);
    } finally {
      setLoading(false); // ✅ SEMPRE remove o loading
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEnderecoConfirmado = (enderecoMapa: any) => {
    setForm((prev) => ({
      ...prev,
      logradouro: enderecoMapa.logradouro || "",
      bairro: enderecoMapa.bairro || "",
      cidade: enderecoMapa.cidade || "",
      cep: enderecoMapa.cep || "",
      numero: enderecoMapa.numero || prev.numero,
    }));
    setMostrarMapa(false);
    toast.success("📍 Endereço atualizado via mapa!");
  };

  const handleCancelar = () => {
    setForm(dadosOriginais);
    toast.info("Alterações descartadas.");
  };

  const handleSalvar = async () => {
    // Validação de Senha
    if (form.senha && form.senha !== form.confirmarSenha) {
      toast.error("❌ As senhas não coincidem!");
      return;
    }

    setSalvando(true);
    try {
      const payload: DadosAlteracaoEmpresa = {
        nome_empresa: form.nome_empresa,
        cep: form.cep.replace(/\D/g, ""),
        logradouro: form.logradouro,
        numero: form.numero,
        bairro: form.bairro,
        cidade: form.cidade,
      };

      // Só envia senha se foi preenchida
      if (form.senha) {
        payload.senha = form.senha;
        payload.confirmar_senha = form.confirmarSenha;
      }

      await empresasService.alterarDados(payload);

      // SUCESSO: Atualiza o backup e zera os campos de senha
      setDadosOriginais({
        ...form,
        senha: "",
        confirmarSenha: "",
      });

      setForm((prev) => ({ ...prev, senha: "", confirmarSenha: "" }));

      toast.success("✅ Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      const msg = error.response?.data?.message || "Erro ao atualizar perfil.";
      toast.error(`❌ ${Array.isArray(msg) ? msg[0] : msg}`);
    } finally {
      setSalvando(false);
    }
  };

  // Verifica alterações (inclui senha se não estiver vazia)
  const temAlteracoes =
    String(form.nome_empresa) !== String(dadosOriginais.nome_empresa) ||
    String(form.cep) !== String(dadosOriginais.cep) ||
    String(form.logradouro) !== String(dadosOriginais.logradouro) ||
    String(form.numero) !== String(dadosOriginais.numero) ||
    String(form.bairro) !== String(dadosOriginais.bairro) ||
    String(form.cidade) !== String(dadosOriginais.cidade) ||
    form.senha !== "";

  // ✅ Estado de Loading
  if (loading) {
    return (
      <div className="perfil-container">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  // ✅ Estado de Erro
  if (erro) {
    return (
      <div className="perfil-container">
        <Card>
          <div style={{ padding: "30px", textAlign: "center" }}>
            <p style={{ color: "#ff5722", marginBottom: "20px" }}>{erro}</p>
            <BotaoTexto
              texto="Tentar Novamente"
              onClick={carregarDados}
              corFundo="#FF5722"
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="perfil-container anime-slide-up">
      {mostrarMapa && (
        <ModalEndereco
          onFechar={() => setMostrarMapa(false)}
          onConfirmar={handleEnderecoConfirmado}
        />
      )}

      <div className="perfil-header">
        <p className="perfil-subtitulo">
          Gerencie as informações da sua empresa
        </p>
      </div>

      <Card>
        <div style={{ padding: "15px" }}>
          {/* --- DADOS GERAIS --- */}
          <h3 className="secao-titulo" style={{ marginTop: 0 }}>
            <FaUserCircle className="icon-laranja" style={{ marginRight: 8 }} />
            Dados da Empresa
          </h3>

          <InputEditavel
            label="Nome Fantasia"
            name="nome_empresa"
            value={form.nome_empresa}
            valorOriginal={dadosOriginais.nome_empresa}
            onChange={handleChange}
          />

          <div className="perfil-grid">
            <InputEditavel
              label="CNPJ (Não editável)"
              name="cnpj"
              value={formatarCnpj(form.cnpj)}
              valorOriginal={formatarCnpj(dadosOriginais.cnpj)}
              onChange={handleChange}
              podeEditar={false}
            />
            <InputEditavel
              label="E-mail (Não editável)"
              name="email"
              value={form.email}
              valorOriginal={dadosOriginais.email}
              onChange={handleChange}
              podeEditar={false}
            />
          </div>

          <div className="divider" style={{ margin: "30px 0" }}></div>

          {/* --- SEGURANÇA --- */}
          <h3 className="secao-titulo">
            <FaLock className="icon-laranja" style={{ marginRight: 8 }} />
            Segurança
          </h3>
          <p
            style={{ fontSize: "0.85rem", color: "#999", marginBottom: "15px" }}
          >
            Preencha apenas se quiser alterar sua senha.
          </p>

          <div className="perfil-grid">
            <InputEditavel
              label="Nova Senha"
              name="senha"
              type="password"
              placeholder="********"
              value={form.senha}
              valorOriginal={dadosOriginais.senha}
              onChange={handleChange}
            />

            <InputEditavel
              label="Confirmar Nova Senha"
              name="confirmarSenha"
              type="password"
              placeholder="********"
              value={form.confirmarSenha}
              valorOriginal={dadosOriginais.confirmarSenha}
              onChange={handleChange}
              podeEditar={form.senha.length > 0}
            />
          </div>

          <div className="divider" style={{ margin: "30px 0" }}></div>

          {/* --- ENDEREÇO --- */}
          <div className="secao-header-flex">
            <h3 className="secao-titulo" style={{ margin: 0 }}>
              <FaMapMarkedAlt
                className="icon-laranja"
                style={{ marginRight: 8 }}
              />
              Endereço
            </h3>

            <button
              type="button"
              className="btn-buscar-mapa-perfil"
              onClick={() => setMostrarMapa(true)}
            >
              <FaMapMarkedAlt /> Buscar no Mapa
            </button>
          </div>

          <p
            style={{
              fontSize: "0.85rem",
              color: "#999",
              marginBottom: "20px",
              marginTop: "5px",
            }}
          >
            Ao alterar o endereço, sua localização no mapa será recalculada.
          </p>

          <div className="perfil-grid">
            <InputEditavel
              label="CEP"
              name="cep"
              value={formatarCep(form.cep)}
              valorOriginal={formatarCep(dadosOriginais.cep)}
              onChange={handleChange}
            />
            <InputEditavel
              label="Cidade"
              name="cidade"
              value={form.cidade}
              valorOriginal={dadosOriginais.cidade}
              onChange={handleChange}
            />
          </div>

          <InputEditavel
            label="Logradouro"
            name="logradouro"
            value={form.logradouro}
            valorOriginal={dadosOriginais.logradouro}
            onChange={handleChange}
          />

          <div className="perfil-grid">
            <InputEditavel
              label="Número"
              name="numero"
              value={form.numero}
              valorOriginal={dadosOriginais.numero}
              onChange={handleChange}
            />
            <InputEditavel
              label="Bairro"
              name="bairro"
              value={form.bairro}
              valorOriginal={dadosOriginais.bairro}
              onChange={handleChange}
            />
          </div>

          {/* --- AÇÕES --- */}
          <div className="perfil-acoes">
            {temAlteracoes && (
              <button
                className="btn-cancelar-alteracoes"
                onClick={handleCancelar}
                disabled={salvando}
              >
                <FaTimes /> Cancelar Alterações
              </button>
            )}

            <div className="btn-perfil-salvar">
              <BotaoTexto
                texto={salvando ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                onClick={handleSalvar}
                corFundo="#FF5722"
                desativado={!temAlteracoes || salvando}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
