DROP DATABASE IF EXISTS takehome;

CREATE DATABASE takehome
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE takehome;

CREATE TABLE empresa (
  id CHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE TABLE usuario (
  id CHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  login VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  empresa_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE registro (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36) NOT NULL,
  usuario_id CHAR(36) NOT NULL,
  tipo ENUM('COMPRA','VENDA') NOT NULL,
  data_hora DATETIME NOT NULL,
  descricao TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  INDEX idx_registro_empresa_updated (empresa_id, updated_at),
  INDEX idx_registro_deleted (deleted_at)
);

CREATE TABLE foto_registro (
  id CHAR(36) PRIMARY KEY,
  registro_id CHAR(36) NOT NULL,
  caminho VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (registro_id) REFERENCES registro(id) ON DELETE CASCADE,
  INDEX idx_foto_registro_updated (updated_at),
  INDEX idx_foto_registro_deleted (deleted_at)
);



INSERT INTO empresa (id, nome) VALUES
('111e8400-e29b-41d4-a716-446655440000', 'Alfa Mais Alimentos Ltda'),
('222e8400-e29b-41d4-a716-446655440000', 'Beta Comandos - Tecnologia Ltda');

INSERT INTO usuario (id, nome, login, senha, empresa_id) VALUES
('aaa11111-e29b-41d4-a716-446655440000', 'Carlos Henrique Souza', 'carlos.souza', '$2b$10$611ar5OKVM0NeNpBZVj9.OmpePmhOe6GcYjOSIiHY.TMFsAmfww2u', '111e8400-e29b-41d4-a716-446655440000'),
('bbb22222-e29b-41d4-a716-446655440000', 'Mariana Oliveira Lima', 'mariana.lima', '$2b$10$F58L4In31QY67OnjV1MwpO7VeLlP3RqMkdwHeaD/9huhjSYj5Lk.2', '222e8400-e29b-41d4-a716-446655440000'),
('3f7e6c3e-6b9e-4b7f-9a2c-5f8c1d2e7a91', 'Diogo Gabriel Izele', 'diogo.izele', '$2b$10$611ar5OKVM0NeNpBZVj9.OmpePmhOe6GcYjOSIiHY.TMFsAmfww2u', '222e8400-e29b-41d4-a716-446655440000');