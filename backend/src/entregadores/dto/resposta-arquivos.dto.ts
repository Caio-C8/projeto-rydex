import { ApiProperty } from "@nestjs/swagger";

export class RespostaArquivosDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty({ description: "URL ou caminho para aceder o arquivo" })
  caminho: string;

  @ApiProperty({
    description: "ID do entregador ao qual o arquivo pertence",
    nullable: true,
  })
  entregador_id: number | null;
}
