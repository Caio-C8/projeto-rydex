import { ApiProperty } from "@nestjs/swagger";

export class RespostaErroValidacaoDto {
  @ApiProperty({
    description: "Indica se a operação foi bem-sucedida",
    example: false,
    default: false,
  })
  sucesso: boolean;

  @ApiProperty({
    description: "O código de status HTTP da resposta",
    example: 400,
  })
  status: number;

  @ApiProperty({
    description: "Uma mensagem geral descrevendo o erro",
    example: "Erro de validação.",
  })
  mensagem: string;

  @ApiProperty({
    description: "Objeto contendo os erros de validação",
    example: {
      cpf: "CPF inválido.",
      senha: "Senha deve conter pelo menos um número.",
      celular: "Número de celular inválido.",
    },
    type: Object,
    required: false,
  })
  erros?: object;
}
