import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import { empresasService } from "../../services/empresasService";
import { ModalEndereco } from "../../components/ModalEndereco/ModalEndereco"; 

import Card from "../../components/ui/Card/Card";
import Formulario from "../../components/ui/Formulario/Formulario";
import Input from "../../components/ui/Input/Input";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import logoRydex from "../../assets/logo-rydex.png";

import { FaEye, FaEyeSlash, FaBuilding, FaMapMarkerAlt, FaEnvelope, FaLock, FaMapMarkedAlt } from "react-icons/fa";
import "./CadastroEmpresa.css";

export default function CadastroEmpresa() {
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  const [erroEndereco, setErroEndereco] = useState(false);

  const [form, setForm] = useState({
    nome_empresa: '',
    cnpj: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlurCep = async () => {
    const cepLimpo = form.cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        if (!res.data.erro) {
          setForm(prev => ({
            ...prev,
            logradouro: res.data.logradouro,
            bairro: res.data.bairro,
            cidade: res.data.localidade
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleEnderecoConfirmado = (endereco: any) => {
    setForm(prev => ({
      ...prev,
      logradouro: endereco.logradouro,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      cep: endereco.cep,
      numero: endereco.numero || prev.numero 
    }));
    setErroEndereco(false);
    toast.success("📍 Endereço preenchido pelo mapa!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validações
    if (!form.nome_empresa || !form.cnpj || !form.email || !form.senha || !form.numero) {
      toast.warning("⚠️ Preencha os campos obrigatórios (*)");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      toast.error("❌ As senhas não coincidem!");
      return;
    }

    const regexSenha = /^(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!regexSenha.test(form.senha)) {
      toast.error("❌ A senha deve conter no mínimo 8 caracteres e pelo menos 1 caractere especial.");
      return;
    }

    setCarregando(true);

    try {
      // 2. Montagem do Payload (CORRIGIDO)
      // NÃO envie latitude/longitude aqui, o backend calcula sozinho.
      const payload = {
        nome_empresa: form.nome_empresa,
        cnpj: form.cnpj.replace(/\D/g, ''), // Remove pontos
        email: form.email,
        senha: form.senha,
        confirmar_senha: form.confirmarSenha, // Backend exige este campo snake_case
        cep: form.cep.replace(/\D/g, ''),   // Remove traço
        cidade: form.cidade,
        numero: parseInt(String(form.numero), 10), // Garante INTEIRO
        bairro: form.bairro,
        logradouro: form.logradouro
        // REMOVIDO: latitude e longitude (Isso causava o erro 400!)
      };

      console.log("📤 Enviando Payload:", payload);

      await empresasService.cadastrar(payload);
      
      toast.success("✅ Empresa cadastrada com sucesso!");
      setTimeout(() => navigate('/login'), 2000);

    } catch (error: any) {
      console.error("❌ Erro COMPLETO no cadastro:", error);
      
      if (error.response) {
        const { data, status } = error.response;
        // Loga o erro real no console para sabermos o que é
        console.log("Resposta de Erro do Backend:", data); 

        const msgBackend = data.message;

        if (msgBackend === "ENDERECO_INVALIDO") {
          setErroEndereco(true);
          toast.error("❌ Endereço não localizado. Use o mapa.");
        }
        else if (msgBackend) {
          // Se for array (vários erros de validação), mostra o primeiro
          const msgFinal = Array.isArray(msgBackend) ? msgBackend[0] : msgBackend;
          toast.error(`❌ ${msgFinal}`);
        } 
        else if (status === 409) {
          toast.error("❌ Email ou CNPJ já cadastrados.");
        }
        else {
          toast.error(`❌ Erro ${status}. Verifique o console.`);
        }
      } else {
        toast.error("❌ Erro de conexão. Verifique sua internet.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-split-container">
      <ToastContainer position="top-right" theme="colored" autoClose={5000} />

      {erroEndereco && (
        <ModalEndereco 
          onFechar={() => setErroEndereco(false)}
          onConfirmar={handleEnderecoConfirmado}
        />
      )}

      <div className="cadastro-left">
        <div className="logo-box anime-fade-in">
          <img src={logoRydex} alt="Logo Rydex" className="cadastro-logo-img" />
        </div>
      </div>

      <div className="cadastro-right">
        <div className="cadastro-form-wrapper anime-slide-up">
          
          <div className="cadastro-header">
            <h1 className="cadastro-title">Cadastre sua Empresa</h1>
            <p className="cadastro-subtitle">Preencha os dados para começar a solicitar entregas</p>
          </div>

          <div className="cadastro-card-custom">
            <Card>
              <Formulario onSubmit={handleSubmit} titulo="">
                
                {/* DADOS CORPORATIVOS */}
                <div className="secao-form">
                  <h3 className="secao-titulo"><FaBuilding className="icon-secao"/> Dados Corporativos</h3>
                  <div className="input-group">
                    <Input label="Nome da Empresa *" placeholder="Ex: Rydex Logística Ltda" name="nome_empresa" value={form.nome_empresa} onChange={handleChange} />
                  </div>
                  <div className="linha-dupla">
                    <Input label="CNPJ *" mask="00.000.000/0000-00" placeholder="00.000.000/0000-00" name="cnpj" value={form.cnpj} onChange={handleChange} />
                    <Input label="E-mail Corporativo *" placeholder="contato@empresa.com" type="email" name="email" value={form.email} onChange={handleChange} Icon={FaEnvelope} />
                  </div>
                </div>

                {/* ACESSO */}
                <div className="secao-form">
                  <h3 className="secao-titulo"><FaLock className="icon-secao"/> Acesso</h3>
                  <div className="linha-dupla">
                    <Input label="Senha *" type={mostrarSenha ? "text" : "password"} placeholder="Mínimo 8 caracteres" name="senha" value={form.senha} onChange={handleChange} Icon={mostrarSenha ? FaEye : FaEyeSlash} iconPosition="right" mostrarIcone={true} onIconClick={() => setMostrarSenha(!mostrarSenha)} />
                    <Input label="Confirmar Senha *" type={mostrarConfirmarSenha ? "text" : "password"} placeholder="Repita a senha" name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} Icon={mostrarConfirmarSenha ? FaEye : FaEyeSlash} iconPosition="right" mostrarIcone={true} onIconClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)} />
                  </div>
                </div>

                {/* LOCALIZAÇÃO */}
                <div className="secao-form">
                  <div className="secao-header-row">
                    <h3 className="secao-titulo" style={{marginBottom: 0}}>
                      <FaMapMarkerAlt className="icon-secao"/> Localização
                    </h3>

                    <button 
                      type="button" 
                      className="btn-mapa-ajuda"
                      onClick={() => setErroEndereco(true)}
                      title="Selecionar local no mapa"
                    >
                      <FaMapMarkedAlt /> Buscar no Mapa
                    </button>
                  </div>

                  <div className="linha-dupla-assimetrica">
                    <div style={{flex: 1}}>
                      <Input label="CEP *" mask="00000-000" name="cep" value={form.cep} onChange={handleChange} onBlur={handleBlurCep} />
                    </div>
                    <div style={{flex: 2}}>
                      <Input label="Cidade *" name="cidade" value={form.cidade} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="linha-dupla-assimetrica">
                    <div style={{flex: 3}}>
                      <Input label="Logradouro *" name="logradouro" value={form.logradouro} onChange={handleChange} />
                    </div>
                    <div style={{flex: 1}}>
                      <Input label="Nº *" name="numero" value={form.numero} onChange={handleChange} />
                    </div>
                  </div>
                  <Input label="Bairro *" name="bairro" value={form.bairro} onChange={handleChange} />
                </div>

                <div className="botao-wrapper-cadastro">
                  <BotaoTexto texto={carregando ? "CADASTRANDO..." : "FINALIZAR CADASTRO"} type="submit" corFundo="#FF5722" />
                </div>

                <div className="login-link-footer">
                  <Link to="/login" className="link-voltar">Já tem uma conta? <strong>Faça Login</strong></Link>
                </div>

              </Formulario>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}