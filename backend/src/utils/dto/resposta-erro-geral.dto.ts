import { ApiProperty } from "@nestjs/swagger";

export class RespostaErroGeralDto {
  @ApiProperty({
    description: "Indica se a operação foi bem-sucedida",
    example: false,
  })
  sucesso: boolean;

  @ApiProperty({
    description: "O código de status HTTP da resposta",
    example: 404,
  })
  status: number;

  @ApiProperty({
    description: "Uma mensagem geral descrevendo o erro",
    example: "Entregador não encontrado.",
  })
  mensagem: string;

  @ApiProperty({
    description: "Um array, geralmente vazio, para erros gerais.",
    example: [],
    type: [String],
  })
  erros: string[];
}
