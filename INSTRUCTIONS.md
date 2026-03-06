Escopo funcional obrigatório

1. Autenticação (Tela de Login)
   Implemente uma tela de login com:
   - [x] Campos: usuário (e-mail ou login) e senha.
   - [x] Botão “Entrar”.
   - [x] Validação mínima de campos obrigatórios.
         Regras:
     - [x] Usuário e senha devem ser validados contra dados vindos do backend (MySQL).
     - [x] Após login bem-sucedido, armazenar o usuário logado localmente (ex.: AsyncStorage ou no próprio WatermelonDB).
     - [x] Se o aplicativo for aberto novamente e ainda existir sessão válida, pular a tela de login.

---

Modelagem de dados

> No banco remoto (MySQL), crie pelo menos as seguintes tabelas:

- [x] Tabela empresa
      • id (PRIMARY KEY, auto incremento).
      • nome (varchar).
- [x] Tabela usuario
      • id (PRIMARY KEY, auto incremento).
      • nome (varchar).
      • login (varchar, único).
      • senha (varchar ou hash).
      • empresa_id (FOREIGN KEY referenciando empresa.id).
- [x] Tabela para lançamentos (por exemplo, registro)
      • id (PRIMARY KEY).
      • empresa_id (FOREIGN KEY).
      • usuario_id (FOREIGN KEY).
      • tipo (enum ou varchar: “COMPRA” ou “VENDA”).
      • data_hora (datetime).
      • descricao (texto).
  - [x] (Opcional) tabela auxiliar para fotos, vinculando caminho/URL das imagens ao registro.
- [x] Dados iniciais obrigatórios:
      • Criar 2 empresas.
      • Criar 2 usuários, cada um vinculado a uma empresa diferente (1 usuário por empresa).
      Requisito:
- [x] Ao logar, o usuário só pode ver e inserir dados relativos à sua própria empresa.

---

WatermelonDB e sincronização offline

> No app React Native, utilize WatermelonDB como base local:

- [x] Configurar schema e models para:
  - [ ] Empresa
  - [ ] Usuario
  - [x] Registro
  - [x] (Opcional) FotoRegistro
- [x] Implementar fluxo de sincronização com o backend (MySQL via API REST), com:
      o pullChanges: buscar alterações do servidor e atualizar o banco local.
      o pushChanges: enviar para o servidor os registros criados/alterados localmente.

Requisitos de comportamento offline:

- [x] app deve funcionar sem conexão (criar registros, editar campos, anexar fotos).
- [x] Assim que a conexão voltar, sincronizar automaticamente ou via botão manual “Sincronizar”.

---

Tela de input principal

> Após o login, o usuário deve ser direcionado para a tela de input (cadastro de lançamentos).

Elementos obrigatórios:

- [x] Select (picker) para seleção do tipo de dado
      • Opções:
  - “Compra”
  - “Venda”
  - Armazenar internamente como valores tipo COMPRA / VENDA.

- [x] Seletor de data/hora
      • Componente para o usuário escolher data e hora do registro.
      • Salvar no formato datetime.
- [x] Campo de texto
      • Campo para o usuário digitar uma descrição do lançamento (mínimo 10 caracteres).
- [x] Inserção de fotos (múltiplas fotos)
      • Botão para adicionar fotos a um registro.
      • Deve permitir:
  - [x] Selecionar foto(s) da galeria.
  - [x] Tirar foto(s) com a câmera.
  - [x] Deve ser possível anexar mais de uma foto.
        o Você pode usar uma biblioteca de múltiplas imagens (ex.: react-native-image-picker com selectionLimit > 1, ou libs específicas de múltiplas imagens).
  - [x] As fotos devem ser persistidas associadas ao registro, mesmo offline, e sincronizadas com o backend de alguma forma (envio do arquivo ou armazenamento do caminho/local).Regras adicionais:
  - [x] Todos os campos obrigatórios devem ser validados antes de salvar.
  - [x] Exibir uma lista dos registros já cadastrados (localmente), com pelo menos:
        o Tipo (Compra/Venda).
        o Data/hora.
        o Descrição.
        o Indicação se já foi sincronizado ou não (ex.: ícone ou texto).
