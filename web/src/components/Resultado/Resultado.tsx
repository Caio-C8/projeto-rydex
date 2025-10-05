import type { Usuario } from "../../utils/types";
import "./Resultado.css";

interface ResultadoProps {
  loading: boolean;
  dados: Usuario | Usuario[] | null;
  mensagem: string | null;
  erros: string[] | null;
}

const Resultado = ({ loading, dados, mensagem, erros }: ResultadoProps) => {
  if (loading) {
    return (
      <div>
        <p>Carregando...</p>
      </div>
    );
  }

  const usuarios = dados ? (Array.isArray(dados) ? dados : [dados]) : [];

  return (
    <div>
      <h3>Resultado</h3>

      {mensagem && (
        <p className={erros ? "mensagemErro" : "mensagemSucesso"}>{mensagem}</p>
      )}

      {erros && (
        <ul className="listaErros">
          {erros.map((erro, index) => (
            <li key={index}>{erro}</li>
          ))}
        </ul>
      )}

      {usuarios.length > 0 && (
        <div className="userList">
          {usuarios.map((user) => (
            <div key={user.id} className="userCard">
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Nome:</strong> {user.nome}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resultado;
