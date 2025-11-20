import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

// Importação dos componentes visuais do projeto
import Card from '../../components/ui/Card/Card';
import Formulario from '../../components/ui/Formulario/Formulario';
import Input from '../../components/ui/Input/Input';
import BotaoTexto from '../../components/ui/Botao/BotaoTexto';
import logoRydex from '../../assets/logo-rydex.png';

// Importação de ícones (certifique-se de ter react-icons instalado)
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

import './Login.css'; 

export function Login() {
  const navigate = useNavigate();
  
  // Estados de dados
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados de UI
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await authService.login(email, senha);
      navigate('/'); 
    } catch (error: any) {
      console.error("Erro no login:", error);
      if (error.response && error.response.data) {
        const msg = error.response.data.message;
        setErro(Array.isArray(msg) ? msg.join(', ') : (msg || 'Erro ao autenticar'));
      } else {
        setErro('Falha ao conectar com o servidor.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      {/* LADO ESQUERDO: LOGO */}
      <div className="left">
        <img src={logoRydex} alt="Logo Rydex" className="login-logo-img" />
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="right">
        <h1 className="title">Bem-vindo de volta!</h1>
        <p className="subtitle">Acesse sua conta</p>

        <Card>
          <Formulario onSubmit={handleLogin} titulo="">
            
            {/* Campo de Email */}
            <Input 
              label="E-mail" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplo@empresa.com"
              desativado={carregando}
              Icon={FaEnvelope} // Ícone de carta
            />
            
            {/* Campo de Senha com Toggle de Visualização */}
            <Input 
              label="Senha" 
              type={mostrarSenha ? "text" : "password"}
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="********"
              desativado={carregando}
              Icon={mostrarSenha ? FaEye : FaEyeSlash} // Alterna ícone
              iconPosition="right"
              mostrarIcone={true}
              onIconClick={() => setMostrarSenha(!mostrarSenha)}
            />

            {/* Link de recuperação */}
            <div className="login-links">
               <Link to="/esqueceu-senha" className="link-esqueceu">
                 Esqueceu sua senha?
               </Link>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="mensagem-erro-box">
                {erro}
              </div>
            )}

            <div className="botao-wrapper">
              <BotaoTexto 
                type="submit" 
                texto={carregando ? "ENTRANDO..." : "ENTRAR"} 
              />
            </div>

          </Formulario>
        </Card>
      </div>
    </div>
  );
}