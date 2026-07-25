import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, beforeEach, describe, it } from "node:test";
import type { Database } from "./types";

const tempDbPath = path.join(os.tmpdir(), `oxetech-test-db-${process.pid}.json`);
process.env.DATA_FILE = tempDbPath;

import {
  addTicketComment,
  createTicket,
  getTicketDetails,
  getTicketsSummary,
  listTickets,
  updateTicketStatus,
} from "./ticketService";

function buildDatabase(): Database {
  return {
    users: [
      { id: "user_ana", name: "Ana Beatriz", email: "ana@example.com", role: "student", password: "123456" },
      { id: "user_carla", name: "Carla Suporte", email: "carla@example.com", role: "support", password: "suporte123" },
    ],
    tickets: [
      {
        id: "ticket_001",
        title: "Erro no login",
        description: "Nao consigo acessar o ambiente virtual",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        assignedToId: "user_carla",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "ticket_002",
        title: "Projetor nao liga",
        description: "Equipamento sem imagem",
        category: "infra",
        status: "in_progress",
        priority: "urgent",
        requesterId: "user_ana",
        createdAt: "2026-05-02T08:15:00.000Z",
        updatedAt: "2026-05-02T08:35:00.000Z",
      },
    ],
    comments: [
      {
        id: "comment_001",
        ticketId: "ticket_001",
        authorId: "user_carla",
        message: "Chamado recebido",
        createdAt: "2026-05-01T11:00:00.000Z",
      },
    ],
  };
}

beforeEach(() => {
  fs.writeFileSync(tempDbPath, JSON.stringify(buildDatabase(), null, 2));
});

after(() => {
  fs.rmSync(tempDbPath, { force: true });
});

describe("createTicket", () => {
  it("cria chamado com status open e prioridade calculada", () => {
    const ticket = createTicket({
      title: "Sala sem energia",
      description: "Toda a sala esta sem energia",
      category: "infra",
      requesterId: "user_ana",
    });

    assert.equal(ticket.status, "open");
    assert.equal(ticket.priority, "urgent");
    assert.ok(ticket.id.startsWith("ticket_"));

    const details = getTicketDetails(ticket.id);
    assert.ok(details, "o chamado deveria ter sido persistido");
  });
});

describe("listTickets", () => {
  it("filtra por status", () => {
    const abertos = listTickets({ status: "open" });
    assert.equal(abertos.length, 1);
    assert.equal(abertos[0].id, "ticket_001");
  });

  it("filtra por categoria", () => {
    const infra = listTickets({ category: "infra" });
    assert.equal(infra.length, 1);
    assert.equal(infra[0].id, "ticket_002");
  });

  it("filtra por busca textual", () => {
    const resultado = listTickets({ search: "login" });
    assert.equal(resultado.length, 1);
    assert.equal(resultado[0].id, "ticket_001");
  });

  it("inclui contagem de comentarios e nao expoe senha do solicitante", () => {
    const resultado = listTickets({ status: "open" });
    const ticket = resultado[0];

    assert.equal(ticket.commentsCount, 1);
    assert.ok(ticket.requester);
    assert.equal((ticket.requester as Record<string, unknown>).password, undefined);
  });
});

describe("getTicketsSummary", () => {
  it("conta chamados por status e urgentes", () => {
    const summary = getTicketsSummary();

    assert.equal(summary.open, 1);
    assert.equal(summary.in_progress, 1);
    assert.equal(summary.urgent, 1);
  });
});

describe("getTicketDetails", () => {
  it("retorna comentarios com autor sem senha", () => {
    const details = getTicketDetails("ticket_001");
    assert.ok(details);
    assert.equal(details?.comments.length, 1);
    assert.equal((details?.comments[0].author as Record<string, unknown>).password, undefined);
  });

  it("retorna undefined para chamado inexistente", () => {
    assert.equal(getTicketDetails("ticket_999"), undefined);
  });
});

describe("updateTicketStatus", () => {
  it("atualiza status e registra comentario informado", () => {
    const updated = updateTicketStatus("ticket_001", {
      status: "closed",
      authorId: "user_carla",
      comment: "Problema resolvido",
    });

    assert.equal(updated?.status, "closed");

    const details = getTicketDetails("ticket_001");
    assert.equal(details?.comments.length, 2);
  });

  it("retorna undefined para chamado inexistente", () => {
    assert.equal(updateTicketStatus("ticket_999", { status: "open" }), undefined);
  });
});

describe("addTicketComment", () => {
  it("adiciona comentario ao chamado", () => {
    const comment = addTicketComment("ticket_002", {
      authorId: "user_carla",
      message: "Verificando o equipamento",
    });

    assert.ok(comment);
    const details = getTicketDetails("ticket_002");
    assert.equal(details?.comments.length, 1);
  });

  it("retorna undefined para chamado inexistente", () => {
    assert.equal(addTicketComment("ticket_999", { authorId: "user_carla", message: "x" }), undefined);
  });
});
