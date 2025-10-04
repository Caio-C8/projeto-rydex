import { HttpStatus } from "@nestjs/common";
import { RespostaApi } from "../types/resposta-api.type";

export class Resposta {
  static sucesso<T>(
    dados: T,
    mensagem: string = "Operação realizada com sucesso.",
    status: HttpStatus = HttpStatus.OK
  ): RespostaApi<T> {
    return {
      sucesso: true,
      status,
      mensagem,
      dados,
    };
  }

  static erro(
    mensagem: string,
    erros: string[] = [],
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ): RespostaApi<null> {
    return {
      sucesso: false,
      status,
      mensagem,
      erros,
    };
  }
}
