# Meu Projeto

Este projeto consiste em um backend com NestJS, um frontend web com React e um frontend mobile com React Native.

## Como rodar em ambiente de desenvolvimento

- Rodar: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

- Parar: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

## Como rodar em ambiente de produção

- Rodar: docker-compose up --build

- Parar: docker-compose down

## Migrations do Banco de Dados

Para criar e aplicar as migrations do banco de dados, execute o seguinte comando:

docker-compose exec backend npx prisma migrate dev --name init-migration
