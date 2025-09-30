# Requisitos

- [Docker](https://www.docker.com/) instalado, para rodar o projeto.
- [PostMan](https://www.postman.com/downloads/) instalado, para testar API.

# Papéis

- Caio: back-end, dev-ops e suporte no front-end (web e mobile);
- Arthur: back-end e suporte no web;
- Sabrina: mobile;
- Gustavo: mobile e suporte back-end;
- Higor: web;
- Antônio: web;

## Como rodar em ambiente de desenvolvimento (atualiza em tempo real a aplicação)

- Rodar na primeira vez: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

- Rodar normalemente: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

- Para os contêineres: CTRL + C e ENTER

- Parar de desenvolver: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

## Como rodar em ambiente de produção

- Rodar na primeira vez: docker-compose up --build

- Rodar normalmente: docker-compose up

- Para os contêineres: CTRL + C e ENTER

- Parar de desenvolver: docker-compose down

## Migrations do Banco de Dados

Para criar e aplicar as migrations do banco de dados, execute o seguinte comando:

docker-compose exec backend npx prisma migrate dev --name init-migration

## Remover dados inúteis do Docker que podem ocupar muito espaço

docker system prune -a --volumes
