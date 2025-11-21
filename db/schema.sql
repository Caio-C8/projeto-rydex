CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "status_entregadores" AS ENUM ('offline', 'online', 'em_entrega');

-- CreateEnum
CREATE TYPE "status_solicitacoes" AS ENUM (
    'pendente',
    'atribuida',
    'finalizada',
    'cancelada'
);

-- CreateEnum
CREATE TYPE "status_entregas" AS ENUM ('em_andamento', 'finalizada', 'cancelada');

-- CreateTable
CREATE TABLE "entregadores" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" TEXT NOT NULL,
    "saldo" INTEGER NOT NULL DEFAULT 0,
    "celular" VARCHAR(15) NOT NULL,
    "status" "status_entregadores" NOT NULL DEFAULT 'offline',
    "placa_veiculo" VARCHAR(100) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "localizacao" GEOGRAPHY(POINT, 4326),
    "ultima_atualizacao_localizacao" TIMESTAMP(6),
    "chave_pix" VARCHAR(100) NOT NULL,
    CONSTRAINT "entregadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "nome_empresa" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" TEXT NOT NULL,
    "saldo" INTEGER NOT NULL DEFAULT 0,
    "cep" VARCHAR(10) NOT NULL,
    "cidade" VARCHAR(255) NOT NULL,
    "numero" INTEGER NOT NULL,
    "bairro" VARCHAR(255) NOT NULL,
    "logradouro" VARCHAR(255) NOT NULL,
    "complemento" VARCHAR(255),
    "ponto_referencia" VARCHAR(255),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "localizacao" GEOGRAPHY(POINT, 4326),
    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_entregas" (
    "id" SERIAL NOT NULL,
    "valor_estimado" INTEGER NOT NULL,
    "valor_entregador" INTEGER NOT NULL,
    "item_retorno" BOOLEAN NOT NULL DEFAULT false,
    "descricao_item_retorno" TEXT,
    "observacao" TEXT,
    "distancia_m" INTEGER,
    "status" "status_solicitacoes" NOT NULL DEFAULT 'pendente',
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelado_em" TIMESTAMP(6),
    "cep" VARCHAR(10) NOT NULL,
    "cidade" VARCHAR(150) NOT NULL,
    "numero" INTEGER NOT NULL,
    "bairro" VARCHAR(150) NOT NULL,
    "logradouro" VARCHAR(150) NOT NULL,
    "complemento" VARCHAR(150),
    "ponto_referencia" VARCHAR(150),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "localizacao" GEOGRAPHY(POINT, 4326),
    "empresa_id" INTEGER NOT NULL,
    CONSTRAINT "solicitacoes_entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "valor_entrega" INTEGER NOT NULL,
    "aceito_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelado_em" TIMESTAMP(6),
    "status" "status_entregas" NOT NULL DEFAULT 'em_andamento',
    "solicitacao_entrega_id" INTEGER NOT NULL,
    "entregador_id" INTEGER NOT NULL,
    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arquivos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "caminho" TEXT NOT NULL,
    "entregador_id" INTEGER,
    CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entregadores_cpf_key" ON "entregadores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "entregadores_email_key" ON "entregadores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_solicitacao_entrega_id_key" ON "entregas"("solicitacao_entrega_id");

-- AddForeignKey
ALTER TABLE
    "solicitacoes_entregas"
ADD
    CONSTRAINT "fk_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "entregas"
ADD
    CONSTRAINT "fk_entregador_entrega" FOREIGN KEY ("entregador_id") REFERENCES "entregadores"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "entregas"
ADD
    CONSTRAINT "fk_solicitacao_entrega" FOREIGN KEY ("solicitacao_entrega_id") REFERENCES "solicitacoes_entregas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE
    "arquivos"
ADD
    CONSTRAINT "fk_entregador" FOREIGN KEY ("entregador_id") REFERENCES "entregadores"("id") ON DELETE
SET
    NULL ON UPDATE NO ACTION;