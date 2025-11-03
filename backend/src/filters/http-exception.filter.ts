import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { Resposta } from "../utils/resposta-api";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (exception instanceof BadRequestException) {
        if (
          typeof exceptionResponse === "object" &&
          !Array.isArray(exceptionResponse)
        ) {
          if (!("message" in exceptionResponse)) {
            response
              .status(status)
              .json(
                Resposta.erro("Erro de validação.", exceptionResponse, status)
              );
            return;
          }

          if (
            "message" in exceptionResponse &&
            Array.isArray(exceptionResponse.message)
          ) {
            const validationErrors = exceptionResponse.message as string[];
            response
              .status(status)
              .json(
                Resposta.erro("Erro de validação.", validationErrors, status)
              );
            return;
          }
        }
      }

      const errorMessage =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message || "Erro no servidor";
      response.status(status).json(Resposta.erro(errorMessage, [], status));
    } else {
      console.error("Erro não tratado:", exception);

      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          Resposta.erro(
            "Ocorreu um erro interno no servidor.",
            [],
            HttpStatus.INTERNAL_SERVER_ERROR
          )
        );
    }
  }
}
