import { AxiosError } from "axios";
import { RespostaErro } from "../types/api.types";

export const tratarErroApi = (error: unknown): string => {
  // Se não houver erro, retorna genérico
  if (!error) return "Ocorreu um erro desconhecido.";

  const axiosError = error as AxiosError<RespostaErro>;

  // Cenario 1: O Backend respondeu com o nosso formato padrão de erro
  if (axiosError.response && axiosError.response.data) {
    const dadosErro = axiosError.response.data;

    // Mensagem principal (ex: "Erro de validação." ou "E-mail inválido.")
    let mensagemFinal = dadosErro.mensagem || "Erro na requisição.";

    // Verifica se existem detalhes no campo 'erros' (ex: validação de formulário)
    if (dadosErro.erros) {
      if (Array.isArray(dadosErro.erros) && dadosErro.erros.length > 0) {
        // Se for um array de strings (ex: ["Senha muito curta", "Email inválido"])
        // Juntamos tudo com quebra de linha
        const detalhes = dadosErro.erros.join("\n• ");
        mensagemFinal = `${mensagemFinal}\n\nDetalhes:\n• ${detalhes}`;
      } else if (
        typeof dadosErro.erros === "object" &&
        Object.keys(dadosErro.erros).length > 0
      ) {
        // Se for um objeto (caso raro no teu filtro atual, mas bom prevenir)
        mensagemFinal = `${mensagemFinal}\nVerifique os dados enviados.`;
      }
    }

    return mensagemFinal;
  }

  // Cenario 2: O Backend não respondeu (Servidor desligado ou erro de rede)
  if (axiosError.request) {
    return "Não foi possível conectar ao servidor. Verifique sua internet ou tente mais tarde.";
  }

  // Cenario 3: Erro na configuração da requisição (Código do App)
  return `Erro interno do aplicativo: ${axiosError.message}`;
};
