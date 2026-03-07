-- ==============================================================
-- SCHEMA CREATION
-- ==============================================================
CREATE TABLE IF NOT EXISTS BENEFICIO (
  ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  NOME VARCHAR(100) NOT NULL,
  DESCRICAO VARCHAR(255),
  VALOR DECIMAL(15,2) NOT NULL,
  ATIVO BOOLEAN DEFAULT TRUE,
  VERSION BIGINT DEFAULT 0
);

-- ==============================================================
-- SEED DATA
-- ==============================================================
INSERT INTO BENEFICIO (NOME, DESCRICAO, VALOR, ATIVO, VERSION) VALUES
('Beneficio A', 'Descrição do Benefício A', 1000.00, TRUE, 0),
('Beneficio B', 'Descrição do Benefício B', 500.00, TRUE, 0),
('Beneficio C', 'Descrição do Benefício C', 2500.00, TRUE, 0),
('Beneficio D', 'Descrição do Benefício D', 100.00, FALSE, 0);
