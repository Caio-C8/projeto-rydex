import { ApiProperty } from "@nestjs/swagger";
import { AlterarEntregadorDto } from "./alterar-entregador.dto";

export class AlterarEntregadorSwaggerDto extends AlterarEntregadorDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Novo arquivo de imagem da CNH",
    required: false,
  })
  imagemCnh?: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Novo arquivo de imagem do Documento do Veículo",
    required: false,
  })
  imagemDocVeiculo?: any;
}
