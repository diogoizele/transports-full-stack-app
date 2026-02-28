CREATE DATABASE IF NOT EXISTS takehome;
USE takehome;

CREATE TABLE empresa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  login VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  empresa_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE registro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo ENUM('COMPRA','VENDA') NOT NULL,
  data_hora DATETIME NOT NULL,
  descricao TEXT NOT NULL,
  sincronizado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresa(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE foto_registro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registro_id INT NOT NULL,
  caminho VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registro_id) REFERENCES registro(id)
);

-- Dados iniciais obrigatórios

INSERT INTO empresa (nome) VALUES 
('Alfa Comércio de Alimentos Ltda'),
('Beta Soluções em Tecnologia Ltda'),
('Gamma Distribuidora Logística S/A'),
('Delta Serviços Financeiros Ltda'),
('Epsilon Indústria de Equipamentos Ltda');

INSERT INTO usuario (nome, login, senha, empresa_id) VALUES
('Carlos Henrique Souza', 'carlos.souza', '123456', 1),
('Mariana Oliveira Lima', 'mariana.lima', '654321', 2);