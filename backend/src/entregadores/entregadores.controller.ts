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
import { FilesInterceptor } from "@nestjs/platform-express";
import { CriarEntregadorDto } from "./dto/criar-entregador.dto";
import { Entregador } from "@prisma/client";
import { AlterarEntregadorDto } from "./dto/alterar-entregador.dto";
import { RespostaImagemDto } from "./dto/resposta-imagem.dto";

@Controller("entregadores")
export class EntregadoresController {
  constructor(private readonly entregadoresService: EntregadoresService) {}

  @Get()
  buscarEntregadores(): Promise<Entregador[]> {
    return this.entregadoresService.buscarEntregadores();
  }

  @Get(":id")
  buscarEntregador(
    @Param("id", ParseIntPipe) id: number
  ): Promise<Entregador | null> {
    return this.entregadoresService.buscarEntregador(id);
  }

  @Get(":id/imagens")
  buscarImagens(
    @Param("id", ParseIntPipe) id: number
  ): Promise<RespostaImagemDto[]> {
    return this.entregadoresService.buscarImagens(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor("imagens"))
  criarEntregador(
    @Body() criarEntregadorDto: CriarEntregadorDto,
    @UploadedFiles() imagens: Array<Express.Multer.File>
  ): Promise<Entregador> {
    return this.entregadoresService.criarEntregador(
      criarEntregadorDto,
      imagens
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
