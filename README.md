# Oxetech Helpdesk API

API simples de chamados de suporte academico, usada como codebase-base para evolucao incremental ao longo do curso de Engenharia de Software Moderna.

O objetivo nao foi reconstruir o sistema do zero, e sim entender a aplicacao existente, identificar problemas tecnicos, aplicar melhorias pequenas e justificar as decisoes por Pull Request.

## Tecnologias

- Node.js 20+
- TypeScript
- Express 5
- Helmet (cabecalhos de seguranca)
- ESLint (typescript-eslint)
- Node Test Runner (`node:test`) via `tsx`
- Docker (execucao local)
- GitHub Actions (CI)

## Requisitos

- Node.js 20 ou superior
- npm
- Docker (opcional, para rodar em container)

## Como rodar (local)

Instale as dependencias:

```bash
npm install
```

Recrie os dados de exemplo, se necessario:

```bash
npm run seed
```

Execute em modo desenvolvimento:

```bash
npm run dev
```

A API ficara disponivel em `http://localhost:3000/api`.

Para gerar e executar a versao compilada:

```bash
npm run build
npm start
```

## Como rodar (Docker)

Build da imagem:

```bash
docker build -t oxetech-helpdesk:latest .
```

Execucao do container:

```bash
docker run --rm -p 3000:3000 oxetech-helpdesk:latest
```

A imagem usa build multi-stage (compila o TypeScript e publica apenas as dependencias de producao) e possui um `HEALTHCHECK` que consulta `GET /api/health`.

## Como testar

Execute os testes automatizados:

```bash
npm test
```

Os testes cobrem:

- calculo de prioridade dos chamados (unitario);
- validacao de entrada na criacao de chamado, atualizacao de status e comentarios (unitario);
- fluxo de integracao do `ticketService` com banco isolado: criacao, filtros, resumo, detalhes, atualizacao de status e comentarios.

Checagem de tipos:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Ha tambem um roteiro de validacao manual em [docs/VALIDACAO.md](docs/VALIDACAO.md).

## Integracao continua (CI)

O workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) executa em cada `push` e `pull_request`:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

## Scripts

- `npm run dev`: executa a API em modo desenvolvimento.
- `npm run seed`: recria o arquivo de dados inicial.
- `npm run lint`: roda o ESLint.
- `npm run typecheck`: valida os tipos TypeScript.
- `npm run build`: compila o projeto para `dist`.
- `npm start`: executa a versao compilada.
- `npm test`: executa os testes automatizados.

## Organizacao do codigo

Separacao atual das responsabilidades:

- `src/server.ts`: bootstrap do Express, middlewares (helmet, cors, log de requisicoes) e tratamento de erros.
- `src/routes.ts`: entrada HTTP.
- `src/ticketService.ts`: regras de negocio dos chamados.
- `src/userService.ts`: exposicao de usuarios sem dados sensiveis (`PublicUser`).
- `src/validation.ts`: validacao de entrada.
- `src/*Repository.ts` e `src/database.ts`: persistencia (infraestrutura).
- `src/errors.ts` e `src/errorHandler.ts`: tratamento padronizado de erros.
- `src/logger.ts` e `src/requestLogger.ts`: logs simples da aplicacao e das requisicoes.
- `src/ids.ts`: geracao de identificadores.

Diagnostico atualizado da codebase: [docs/DIAGNOSTICO.md](docs/DIAGNOSTICO.md).
Principais decisoes tecnicas: [docs/DECISOES.md](docs/DECISOES.md).

## Seguranca basica

- O campo `password` nunca e retornado pela API (usuarios sao expostos como `PublicUser`).
- Cabecalhos de seguranca aplicados com `helmet`.
- Validacao de entrada em todos os endpoints de escrita, com erros padronizados via `AppError`.

## Endpoints principais

### Healthcheck

```http
GET /api/health
```

### Listar usuarios

```http
GET /api/users
```

### Listar chamados

```http
GET /api/tickets
GET /api/tickets?status=open
GET /api/tickets?category=infra
GET /api/tickets?search=login
```

### Resumo dos chamados

```http
GET /api/tickets/summary
```

### Detalhar chamado

```http
GET /api/tickets/ticket_001
```

### Criar chamado

Categorias aceitas: `infra`, `sistemas`, `academico`.

```http
POST /api/tickets
Content-Type: application/json

{
  "title": "Nao consigo enviar atividade",
  "description": "O sistema apresenta erro ao anexar o arquivo da atividade.",
  "category": "sistemas",
  "requesterId": "user_ana"
}
```

### Atualizar status

Status aceitos: `open`, `in_progress`, `resolved`, `closed`.
Para fechar um chamado (`closed`), o campo `comment` e obrigatorio.

```http
PATCH /api/tickets/ticket_001/status
Content-Type: application/json

{
  "status": "in_progress",
  "authorId": "user_carla",
  "comment": "Chamado em atendimento."
}
```

### Adicionar comentario

```http
POST /api/tickets/ticket_001/comments
Content-Type: application/json

{
  "authorId": "user_carla",
  "message": "Solicitei mais informacoes ao usuario."
}
```

## Jornada de refatoracao

O projeto evoluiu de forma incremental em Pull Requests pequenos e justificados:

- Avaliacao 1: Clean Code, code smells, refatoracao e SOLID introdutorio.
- Avaliacao 2: separacao de responsabilidades, validacao, tratamento de erros e testes.
- Projeto Final: seguranca basica, logs, mais testes, lint, Docker e CI.

Consulte [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md) para o escopo esperado de cada entrega.
