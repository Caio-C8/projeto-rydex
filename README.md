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

- Rodar na primeira vez:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build 
```

```bash
docker-compose exec backend npx prisma migrate dev
```

OU

```bash
docker-compose exec backend npx prisma migrate reset
```

- Rodar normalemente:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

- Parar os contêineres: CTRL + C e ENTER

- Parar de desenvolver:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Como rodar em ambiente de produção

- Rodar na primeira vez:

```bash
docker-compose -f docker-compose.yml up --build -d
```

```bash
docker-compose exec backend npx prisma migrate deploy
```

- Rodar normalmente:

```bash
docker-compose -f docker-compose.yml up -d
```

- Parar os contêineres: CTRL + C e ENTER

- Parar de desenvolver:

```bash
docker-compose -f docker-compose.yml down
```

## Remover dados inúteis do Docker que podem ocupar muito espaço

docker system prune -a --volumes
