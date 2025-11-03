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
      whitelist: true,
      transform: true,

      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = {};

        errors.forEach((err) => {
          if (err.constraints) {
            formattedErrors[err.property] = Object.values(err.constraints)[0];
          }
        });

        return new BadRequestException(formattedErrors);
      },
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RespostaInterceptor());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Rydex API")
    .setDescription("Documentação da API do projeto Rydex")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
