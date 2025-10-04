import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";
import { Usuario } from "@prisma/client";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto";

interface RespostaPadrao<T = any> {
  mensagem: string;
  sucesso: boolean;
  status: number;
  data: T;
}

function criarResponse<T>(
  message: string,
  data: T,
  status: number
): RespostaPadrao<T> {
  return {
    mensagem: message,
    sucesso: status >= 200 && status < 300,
    status,
    data,
  };
}

@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async findAll(): Promise<RespostaPadrao<Usuario[]>> {
    const usuarios = await this.usuariosService.findAll();
    return criarResponse(
      "Usuários listados com sucesso.",
      usuarios,
      HttpStatus.OK
    );
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<RespostaPadrao<Usuario>> {
    const usuario = await this.usuariosService.findOne(id);
    return criarResponse("Usuário encontrado.", usuario, HttpStatus.OK);
  }

  @Post()
  async create(
    @Body() criarUsuarioDto: CriarUsuarioDto
  ): Promise<RespostaPadrao<Usuario>> {
    const usuario = await this.usuariosService.create(criarUsuarioDto);
    return criarResponse(
      "Usuário criado com sucesso.",
      usuario,
      HttpStatus.CREATED
    );
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() atualizarUsuarioDto: AtualizarUsuarioDto
  ): Promise<RespostaPadrao<Usuario>> {
    const usuario = await this.usuariosService.update(id, atualizarUsuarioDto);
    return criarResponse(
      "Usuário atualizado com sucesso.",
      usuario,
      HttpStatus.OK
    );
  }

  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number
  ): Promise<RespostaPadrao<Usuario>> {
    const usuarioRemovido = await this.usuariosService.remove(id);
    return criarResponse(
      "Usuário removido com sucesso.",
      usuarioRemovido,
      HttpStatus.OK
    );
  }
}