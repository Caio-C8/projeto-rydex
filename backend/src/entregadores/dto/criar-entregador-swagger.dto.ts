import { ApiProperty } from "@nestjs/swagger";
import { CriarEntregadorDto } from "./criar-entregador.dto";

export class CriarEntregadorSwaggerDto extends CriarEntregadorDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Arquivo de imagem da CNH",
    required: true,
  })
  imagemCnh: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Arquivo de imagem do Documento do Veículo",
    required: true,
  })
  imagemDocVeiculo: any;
}
