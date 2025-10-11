CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE status_entregadores AS ENUM ('offline', 'online', 'em_entrega');

CREATE TYPE status_solicitacoes AS ENUM ('pendente', 'atribuida', 'cancelada');

CREATE TYPE status_entregas AS ENUM ('em_andamento', 'finalizada', 'cancelada');

CREATE TABLE IF NOT EXISTS entregadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    saldo INT NOT NULL DEFAULT 0,
    celular VARCHAR(15) NOT NULL,
    status status_entregadores NOT NULL DEFAULT 'offline',
    placa_veiculo VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    localizacao GEOGRAPHY(POINT, 4326),
    ultima_atualizacao_localizacao TIMESTAMP,
    chave_pix VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS imagens (
    id SERIAL PRIMARY KEY,
    nome_imagem VARCHAR(255) NOT NULL,
    conteudo BYTEA,
    entregador_id INT,
    CONSTRAINT fk_entregador FOREIGN KEY(entregador_id) REFERENCES entregadores(id) ON DELETE
    SET
        NULL
);

CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    saldo INT NOT NULL DEFAULT 0,
    cep VARCHAR(10) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    numero INT NOT NULL,
    bairro VARCHAR(255) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    complemento VARCHAR(255),
    ponto_referencia VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    localizacao GEOGRAPHY(POINT, 4326)
);

CREATE TABLE IF NOT EXISTS solicitacoes_entregas (
    id SERIAL PRIMARY KEY,
    valor_estimado INT NOT NULL CHECK(valor_estimado > 0),
    item_retorno BOOLEAN NOT NULL DEFAULT FALSE,
    descricao_item_retorno TEXT,
    observacao TEXT,
    distancia_m INT,
    status status_solicitacoes NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelado_em TIMESTAMP,
    cep VARCHAR(10) NOT NULL,
    cidade VARCHAR(150) NOT NULL,
    numero INT NOT NULL,
    bairro VARCHAR(150) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    complemento VARCHAR(150),
    ponto_referencia VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    localizacao GEOGRAPHY(POINT, 4326),
    empresa_id INT NOT NULL,
    CONSTRAINT fk_empresa FOREIGN KEY(empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entregas (
    id SERIAL PRIMARY KEY,
    valor_entrega INT NOT NULL CHECK(valor_entrega > 0),
    aceito_em TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelado_em TIMESTAMP,
    status status_entregas NOT NULL DEFAULT 'em_andamento',
    solicitacao_entrega_id INT NOT NULL UNIQUE,
    entregador_id INT NOT NULL,
    CONSTRAINT fk_solicitacao_entrega FOREIGN KEY(solicitacao_entrega_id) REFERENCES solicitacoes_entregas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_entregador_entrega FOREIGN KEY(entregador_id) REFERENCES entregadores(id) ON DELETE RESTRICT
);

-- CREATE TABLE IF NOT EXISTS configuracoes (
--     id SERIAL PRIMARY KEY,
--     chave VARCHAR(255) NOT NULL UNIQUE,
--     descricao TEXT,
--     valor_int INT,
--     valor_string VARCHAR(255),
--     valor_boolean BOOLEAN,
--     CONSTRAINT chk_apenas_um_valor CHECK (
--         (
--             CASE
--                 WHEN valor_int IS NOT NULL THEN 1
--                 ELSE 0
--             END
--         ) + (
--             CASE
--                 WHEN valor_string IS NOT NULL THEN 1
--                 ELSE 0
--             END
--         ) + (
--             CASE
--                 WHEN valor_boolean IS NOT NULL THEN 1
--                 ELSE 0
--             END
--         ) = 1
--     )
-- );
-- CREATE
-- OR REPLACE FUNCTION fn_atualizar_localizacao() RETURNS TRIGGER AS $ $ BEGIN IF NEW.latitude IS NOT NULL
-- AND NEW.longitude IS NOT NULL THEN NEW.localizacao = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326) :: geography;
-- END IF;
-- RETURN NEW;
-- END;
-- $ $ LANGUAGE plpgsql;
-- -- Trigger para a tabela 'entregadores'
-- CREATE
-- OR REPLACE TRIGGER trg_atualizar_geografia_entregadores BEFORE
-- INSERT
--     OR
-- UPDATE
--     ON entregadores FOR EACH ROW EXECUTE FUNCTION fn_atualizar_localizacao();
-- -- Trigger para a tabela 'empresas'
-- CREATE
-- OR REPLACE TRIGGER trg_atualizar_geografia_empresas BEFORE
-- INSERT
--     OR
-- UPDATE
--     ON empresas FOR EACH ROW EXECUTE FUNCTION fn_atualizar_localizacao();
-- -- Trigger para a tabela 'solicitacoes_entregas'
-- CREATE
-- OR REPLACE TRIGGER trg_atualizar_geografia_solicitacoes BEFORE
-- INSERT
--     OR
-- UPDATE
--     ON solicitacoes_entregas FOR EACH ROW EXECUTE FUNCTION fn_atualizar_localizacao();