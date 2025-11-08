import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, Min } from "class-validator";

export class TransacaoSaldoDto {
  @ApiProperty({
    description: "O valor da transação (em centavos)",
    example: 5000,
    minimum: 1,
  })
  @IsNumber({}, { message: "O valor deve ser um número." })
  @IsInt({ message: "O valor deve ser um número inteiro (centavos)." })
  @Min(1, { message: "O valor deve ser de no mínimo 1 centavo." })
  valor: number;
}
