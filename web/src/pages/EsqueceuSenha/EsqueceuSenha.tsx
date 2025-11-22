import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Importamos o serviço correto
import { empresasService } from "../../services/empresasService";

import Card from "../../components/ui/Card/Card";
import Formulario from "../../components/ui/Formulario/Formulario";
import Input from "../../components/ui/Input/Input";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import logoRydex from "../../assets/logo-rydex.png";
import "./EsqueceuSenha.css";

import { FaEye, FaEyeSlash } from "react-icons/fa";

const EsqueceuSenha: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  // UI
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Função auxiliar para validar senha forte (igual ao Backend)
  const senhaEhValida = (senha: string) => {
    const temNumero = /.*\d/.test(senha);
    const temEspecial = /.*[!@#$%^&*(),.?":{}|<>]/.test(senha);
    const tamanhoMinimo = senha.length >= 8;
    return temNumero && temEspecial && tamanhoMinimo;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validações Básicas
    if (!email || !novaSenha || !confirmarSenha) {
      toast.warning("⚠️ Por favor, preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("❌ As senhas não coincidem.");
      return;
    }

    // 2. Validação Rigorosa (Regra do Backend)
    if (!senhaEhValida(novaSenha)) {
      toast.warning("⚠️ A senha deve ter no mínimo 8 caracteres, 1 número e 1 caractere especial.");
      return;
    }

    setCarregando(true);

    try {
      // 3. Montar o Payload (snake_case como o DTO pede)
      const payload = {
        email: email,
        nova_senha: novaSenha,
        confirmar_senha: confirmarSenha
      };

      console.log("📤 Enviando solicitação de troca...", payload);

      // 4. Chamar o Serviço
      await empresasService.redefinirSenha(payload);
      
      toast.success("✅ Senha alterada com sucesso! Redirecionando...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      console.error("Erro na troca de senha:", error);
      
      if (error.response) {
        const { data, status } = error.response;
        const msg = data.message;

        // Tratamento de erros específicos
        if (msg) {
          // Se for array (vários erros de validação), mostra o primeiro
          const msgFinal = Array.isArray(msg) ? msg[0] : msg;
          toast.error(`❌ ${msgFinal}`);
        } else if (status === 404) {
          toast.error("❌ E-mail não encontrado no sistema.");
        } else {
          toast.error("❌ Erro ao redefinir senha. Tente novamente.");
        }
      } else {
        toast.error("❌ Erro de conexão com o servidor.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-split-container">
      {/* Toast para feedbacks */}
      <ToastContainer position="top-right" theme="colored" autoClose={4000} />

      <div className="login-left">
        <div className="logo-box anime-fade-in">
          <img src={logoRydex} alt="Logo Rydex" className="login-logo-img" />
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper anime-slide-up">
          
          <div className="login-header">
            <h1 className="login-title">Troque sua senha</h1>
            <p className="login-subtitle">Defina uma nova senha segura para sua conta</p>
          </div>

          <div className="login-card-custom">
            <Card>
              <Formulario onSubmit={handleSubmit} titulo="">
                
                <div className="input-group">
                  <Input
                    label="E-mail da Conta"
                    type="email"
                    placeholder="exemplo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    desativado={carregando}
                  />
                </div>

                <div className="input-group">
                  <Input
                    label="Nova Senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Mín 8 chars, 1 número, 1 símbolo"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    desativado={carregando}
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
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    desativado={carregando}
                    Icon={mostrarConfirmar ? FaEye : FaEyeSlash}
                    iconPosition="right"
                    mostrarIcone={true}
                    onIconClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  />
                </div>

                <div className="botao-wrapper" style={{ marginTop: '25px' }}>
                  <BotaoTexto 
                    texto={carregando ? "ALTERANDO..." : "ALTERAR SENHA"} 
                    type="submit" 
                    corFundo="#FF5722" 
                  />
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