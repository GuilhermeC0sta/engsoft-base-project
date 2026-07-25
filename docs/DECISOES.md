# Decisoes Tecnicas

Este documento registra as principais decisoes tomadas ao longo da evolucao da codebase, com foco no que muda o comportamento, a organizacao ou a qualidade do projeto. As decisoes acompanham o nivel introdutorio do curso: preferencia por solucoes simples, seguras e faceis de justificar.

## 1. Separacao de responsabilidades em camadas simples

**Contexto:** o `routes.ts` original concentrava entrada HTTP, regra de negocio e acesso a dados.

**Decisao:** dividir em camadas leves — HTTP (`routes.ts`), regra de negocio (`ticketService.ts`, `userService.ts`), persistencia (`database.ts`, `*Repository.ts`).

**Motivo:** melhora leitura, teste e evolucao sem introduzir arquitetura complexa (sem DDD ou Clean Architecture completa, fora do escopo do curso).

## 2. Tratamento de erros padronizado com `AppError`

**Decisao:** usar uma classe `AppError` com `statusCode` e `details`, tratada em um `errorHandler` unico.

**Motivo:** respostas de erro consistentes (sempre `{ message, ...details }`) e status HTTP corretos, evitando o padrao anterior misturando `message` e `error`.

## 3. Validacao de entrada explicita

**Decisao:** validar corpo das requisicoes em `validation.ts`, checando campos obrigatorios, strings vazias, categorias/status validos e existencia de usuarios referenciados.

**Motivo:** impedir dados invalidos de chegarem a regra de negocio e a persistencia, com mensagens claras.

## 4. Seguranca basica

**Decisoes:**

- Nunca retornar o campo `password`. Foi criado o tipo `PublicUser` (`Omit<User, "password">`) e o `userService` mapeia usuarios para a forma publica antes de sair pela API.
- Adicionar `helmet` para cabecalhos de seguranca padrao.

**Motivo:** o retorno anterior de `GET /api/users` e dos objetos embutidos (solicitante, responsavel, autor de comentario) vazava a senha dos usuarios. Essa foi a correcao de seguranca mais relevante encontrada.

## 5. Logs simples

**Decisao:** centralizar logs em `logger.ts` (niveis `info`/`warn`/`error` com timestamp) e registrar cada requisicao com `requestLogger.ts` (metodo, rota, status e duracao).

**Motivo:** substituir `console.log`/`console.error` espalhados por uma saida consistente e util para depuracao, sem observabilidade avancada.

## 6. Reducao de duplicacao

**Decisoes:**

- Extrair `generateId` para `ids.ts`.
- Extrair `resolveParticipants` no `ticketService` (usado por `listTickets` e `getTicketDetails`).
- Consolidar `new Date().toISOString()` em uma unica constante por operacao.

**Motivo:** remover repeticao e magic numbers, deixando o codigo mais claro e coerente.

## 7. Testabilidade da persistencia

**Decisao:** resolver o caminho do banco em tempo de execucao (`getDatabasePath`), respeitando `DATA_FILE` a cada chamada.

**Motivo:** permitir que os testes de integracao usem um banco JSON temporario e isolado, sem afetar `data/db.json`.

## 8. Testes automatizados

**Decisao:** manter testes unitarios (prioridade e validacao) e adicionar testes de integracao do `ticketService` cobrindo criacao, filtros, resumo, detalhes, atualizacao de status e comentarios.

**Motivo:** proteger comportamentos importantes contra regressao, sem buscar cobertura total.

## 9. Padronizacao de ambiente e automacao

**Decisoes:**

- `Dockerfile` multi-stage + `.dockerignore` para execucao local previsivel.
- ESLint com flat config para lint consistente.
- GitHub Actions rodando lint, typecheck, testes e build em cada push/PR.

**Motivo:** garantir que o projeto roda de forma reproduzivel e que as validacoes basicas sao verificadas automaticamente, mantendo Docker e CI o mais simples possivel.

## Limitacoes conhecidas

- Persistencia em arquivo JSON (nao concorrente, sem banco real) — adequado ao escopo didatico.
- Sem autenticacao/autorizacao real; senhas ainda ficam no arquivo de dados (apenas nao sao mais expostas pela API).
- Cobertura de testes focada nas partes mais importantes, nao total.
