// import { Injectable, NotFoundException } from "@nestjs/common";
// import { PrismaService } from "../prisma.service";
// import { Usuario } from "@prisma/client";
// import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
// import { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto";

// @Injectable()
// export class UsuariosService {
//   constructor(private prisma: PrismaService) {}

//   create(criarUsuarioDto: CriarUsuarioDto): Promise<Usuario> {
//     return this.prisma.usuario.create({
//       data: criarUsuarioDto,
//     });
//   }

//   findAll(): Promise<Usuario[]> {
//     return this.prisma.usuario.findMany();
//   }

//   async findOne(id: number): Promise<Usuario> {
//     const usuario = await this.prisma.usuario.findUnique({
//       where: { id },
//     });

//     if (!usuario) {
//       throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
//     }

//     return usuario;
//   }

//   async update(
//     id: number,
//     atualzarUsuarioDto: AtualizarUsuarioDto
//   ): Promise<Usuario> {
//     await this.findOne(id);
//     return this.prisma.usuario.update({
//       where: { id },
//       data: atualzarUsuarioDto,
//     });
//   }

//   async remove(id: number): Promise<Usuario> {
//     await this.findOne(id);
//     return this.prisma.usuario.delete({
//       where: { id },
//     });
//   }
// }
