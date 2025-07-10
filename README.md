# Outsera Core API

API para gerenciamento de filmes construída com NestJS.

## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Configure a porta da aplicação:
```env
PORT=3000
```

3. Execute a aplicação:

**Modo desenvolvimento:**
```bash
npm run dev
```

**Modo produção:**
```bash
npm run build
npm run start:prod
```

## 📖 Documentação da API

Após executar o projeto, a documentação da API estará disponível em:

```
http://localhost:3000/api
```

A documentação é gerada automaticamente usando Swagger/OpenAPI.

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

## 📁 Estrutura do Projeto

O projeto segue os princípios de Clean Architecture:

- `src/modules/movies/` - Módulo de filmes
  - `application/` - Casos de uso e outputs
  - `domain/` - Entidades e contratos
  - `infra/` - Implementações de infraestrutura
- `src/modules/shared/` - Módulos compartilhados
- `src/resources/` - Recursos estáticos (arquivos CSV, etc.)


## 📋 Funcionalidades

- CRUD de filmes
- Validação de dados
- Documentação automática da API
- Testes unitários e de integração
- Arquitetura limpa e modular (DDD)