import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErreurApi, creerClientCamille } from "../src/client";

const tour = {
  sessionId: "5efebd6a-13a5-4279-b7f8-676900ecdfcf",
  camille: "Bonjour !",
  echange: 0,
  maxEchanges: 8,
  terminee: false,
};

/** fetch falso: devolve sempre a mesma resposta e regista os pedidos. */
function fetchFalso(status: number, corps: unknown) {
  const appels: Array<{ url: string; init: RequestInit }> = [];
  const fn = (async (url: string, init: RequestInit) => {
    appels.push({ url, init });
    return new Response(JSON.stringify(corps), { status });
  }) as typeof fetch;
  return { fn, appels };
}

describe("creerClientCamille", () => {
  it("cria uma sessão e valida a resposta", async () => {
    const { fn, appels } = fetchFalso(201, tour);
    const client = creerClientCamille({ baseUrl: "http://api.test/", fetch: fn });

    const resultat = await client.creerSession({
      niveau: "B1",
      tache: "entretien",
      langueAppui: "pt-PT",
    });

    assert.deepEqual(resultat, tour);
    assert.equal(appels[0]?.url, "http://api.test/sessions");
    assert.equal(appels[0]?.init.method, "POST");
    assert.deepEqual(JSON.parse(String(appels[0]?.init.body)), {
      niveau: "B1",
      tache: "entretien",
      langueAppui: "pt-PT",
    });
  });

  it("envia a resposta do aluno para a sessão certa", async () => {
    const { fn, appels } = fetchFalso(200, { ...tour, echange: 1 });
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });

    await client.envoyerMessage(tour.sessionId, "Je m'appelle Nour.");

    assert.equal(appels[0]?.url, `http://api.test/sessions/${tour.sessionId}/messages`);
    assert.deepEqual(JSON.parse(String(appels[0]?.init.body)), { texte: "Je m'appelle Nour." });
  });

  it("transforma erros da API em ErreurApi com a mensagem do servidor", async () => {
    const { fn } = fetchFalso(409, { statusCode: 409, message: "A sessão já terminou." });
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });

    await assert.rejects(client.envoyerMessage(tour.sessionId, "Encore"), (erreur) => {
      assert.ok(erreur instanceof ErreurApi);
      assert.equal(erreur.status, 409);
      assert.equal(erreur.message, "A sessão já terminou.");
      assert.equal(erreur.temporaire, true);
      return true;
    });
  });

  it("recusa respostas que não seguem o contrato", async () => {
    const { fn } = fetchFalso(200, { camille: 42 });
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });

    await assert.rejects(client.terminer(tour.sessionId), {
      message: "Resposta inesperada da API.",
    });
  });

  it("assinala falhas de rede com status 0", async () => {
    const fn = (async () => {
      throw new TypeError("Network request failed");
    }) as typeof fetch;
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });

    await assert.rejects(client.terminer(tour.sessionId), (erreur) => {
      assert.ok(erreur instanceof ErreurApi);
      assert.equal(erreur.status, 0);
      assert.equal(erreur.message, "Sem ligação à API.");
      return true;
    });
  });
});
