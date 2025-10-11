// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Delete,
//   Put,
//   ParseIntPipe,
//   HttpStatus,
//   HttpException,
// } from "@nestjs/common";
// import { UsuariosService } from "./usuarios.service";
// import { Usuario } from "@prisma/client";
// import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
// import { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto";
// import { Resposta } from "../utils/resposta-api";
// import { RespostaApi } from "../types/resposta-api.type";

// @Controller("usuarios")
// export class UsuariosController {
//   constructor(private readonly usuariosService: UsuariosService) {}

//   @Get()
//   async findAll(): Promise<RespostaApi<Usuario[]>> {
//     try {
//       const usuarios = await this.usuariosService.findAll();
//       return Resposta.sucesso(usuarios, "Usuários listados com sucesso");
//     } catch (erro) {
//       throw new HttpException(
//         Resposta.erro("Erro ao listar usuários", [erro.message]),
//         HttpStatus.BAD_REQUEST
//       );
//     }
//   }

//   @Get(":id")
//   async findOne(
//     @Param("id", ParseIntPipe) id: number
//   ): Promise<RespostaApi<Usuario>> {
//     try {
//       const usuario = await this.usuariosService.findOne(id);
//       return Resposta.sucesso(usuario, "Usuário encontrado com sucesso");
//     } catch (erro) {
//       throw new HttpException(
//         Resposta.erro("Erro ao encontrar usuário", [erro.message]),
//         HttpStatus.BAD_REQUEST
//       );
//     }
//   }

//   @Post()
//   async create(
//     @Body() criarUsuarioDto: CriarUsuarioDto
//   ): Promise<RespostaApi<Usuario>> {
//     try {
//       const usuario = await this.usuariosService.create(criarUsuarioDto);
//       return Resposta.sucesso(usuario, "Usuário criado com sucesso");
//     } catch (erro) {
//       throw new HttpException(
//         Resposta.erro("Erro ao criar usuário", [erro.message]),
//         HttpStatus.BAD_REQUEST
//       );
//     }
//   }

//   @Put(":id")
//   async update(
//     @Param("id", ParseIntPipe) id: number,
//     @Body() atualizarUsuarioDto: AtualizarUsuarioDto
//   ): Promise<RespostaApi<Usuario>> {
//     try {
//       const usuario = await this.usuariosService.update(
//         id,
//         atualizarUsuarioDto
//       );
//       return Resposta.sucesso(usuario, "Usuário atualizado com sucesso");
//     } catch (erro) {
//       throw new HttpException(
//         Resposta.erro("Erro ao atualizar usuário", [erro.message]),
//         HttpStatus.BAD_REQUEST
//       );
//     }
//   }

//   @Delete(":id")
//   async remove(
//     @Param("id", ParseIntPipe) id: number
//   ): Promise<RespostaApi<Usuario>> {
//     try {
//       const usuarioRemovido = await this.usuariosService.remove(id);
//       return Resposta.sucesso(usuarioRemovido, "Usuário removido com sucesso");
//     } catch (erro) {
//       throw new HttpException(
//         Resposta.erro("Erro ao remover usuário", [erro.message]),
//         HttpStatus.BAD_REQUEST
//       );
//     }
//   }
// }
