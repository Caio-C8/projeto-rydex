import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { EntregadoresService } from "./entregadores.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Entregador, Arquivos } from "@prisma/client";
import { CriarEntregadorDto } from "./dto/criar-entregador.dto";
import { AlterarEntregadorDto } from "./dto/alterar-entregador.dto";
import { RespostaImagemDto } from "./dto/resposta-imagem.dto";

@Controller("entregadores")
export class EntregadoresController {
  constructor(private readonly entregadoresService: EntregadoresService) {}

  @Get()
  buscarEntregadores(): Promise<(Entregador & { arquivos: Arquivos[] })[]> {
    return this.entregadoresService.buscarEntregadores();
  }

  @Get(":id")
  buscarEntregador(
    @Param("id", ParseIntPipe) id: number
  ): Promise<Entregador & { arquivos: Arquivos[] }> {
    return this.entregadoresService.buscarEntregador(id);
  }

  @Get(":id/imagens")
  buscarImagens(
    @Param("id", ParseIntPipe) id: number
  ): Promise<RespostaImagemDto[]> {
    return this.entregadoresService.buscarImagens(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "imagemCnh", maxCount: 1 },
      { name: "imagemDocVeiculo", maxCount: 1 },
    ])
  )
  criarEntregador(
    @Body() criarEntregadorDto: CriarEntregadorDto,
    @UploadedFiles()
    files: {
      imagemCnh?: Express.Multer.File[];
      imagemDocVeiculo?: Express.Multer.File[];
    }
  ): Promise<Entregador & { arquivos: Arquivos[] }> {
    const imagemCnh = files.imagemCnh ? files.imagemCnh[0] : undefined;
    const imagemDocVeiculo = files.imagemDocVeiculo
      ? files.imagemDocVeiculo[0]
      : undefined;

    return this.entregadoresService.criarEntregador(
      criarEntregadorDto,
      imagemCnh,
      imagemDocVeiculo
    );
  }

  @Patch(":id")
  @UseInterceptors(FilesInterceptor("imagens"))
  atualizarEntregador(
    @Param("id", ParseIntPipe) id: number,
    @Body() alterarEntregadorDto: AlterarEntregadorDto,
    @UploadedFiles() imagens: Array<Express.Multer.File>
  ): Promise<Entregador> {
    return this.entregadoresService.alterarEntregador(
      id,
      alterarEntregadorDto,
      imagens
    );
  }
}
