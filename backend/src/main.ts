import { NestFactory } from "@nestjs/core";
import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { RespostaInterceptor } from "./interceptors/resposta.interceptor";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // 1. Remove campos extras da requisição (que não estão no DTO)
      whitelist: true,

      // 2. (MELHORIA) Lança um erro se campos extras forem enviados (boa prática)
      forbidNonWhitelisted: true,

      // 3. Habilita a transformação automática (essencial para o @Transform)
      transform: true,

      // 4. (MELHORIA) Habilita a conversão implícita de tipos (ex: string de URL para number)
      transformOptions: {
        enableImplicitConversion: true,
      },

      // 5. Sua fábrica de exceções personalizada para formatar os erros
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = {};

        errors.forEach((err) => {
          if (err.constraints) {
            formattedErrors[err.property] = Object.values(err.constraints)[0];
          }
          // (MELHORIA) Adicionado para lidar com erros em objetos aninhados (se houver)
          else if (err.children && err.children.length > 0) {
            err.children.forEach((childErr) => {
              if (childErr.constraints) {
                formattedErrors[`${err.property}.${childErr.property}`] =
                  Object.values(childErr.constraints)[0];
              }
            });
          }
        });

        return new BadRequestException(formattedErrors);
      },
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RespostaInterceptor());

  app.enableCors(); // Habilita o CORS

  const config = new DocumentBuilder()
    .setTitle("Rydex API")
    .setDescription("Documentação da API do projeto Rydex")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, document); // Sua rota do Swagger

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
