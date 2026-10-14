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

  it("envia a gravação como multipart, sem forçar o content-type", async () => {
    const { fn, appels } = fetchFalso(200, { ...tour, echange: 1, texteEleve: "Bonjour." });
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });
    const audio = new FormData();
    audio.append("audio", new Blob(["..."], { type: "audio/webm" }), "resposta.webm");

    const resultat = await client.envoyerAudio(tour.sessionId, audio);

    assert.equal(resultat.texteEleve, "Bonjour.");
    assert.equal(appels[0]?.url, `http://api.test/sessions/${tour.sessionId}/audio`);
    assert.equal(appels[0]?.init.body, audio);
    assert.deepEqual(appels[0]?.init.headers, { accept: "application/json" });
  });

  it("transforma erros da API em ErreurApi com o código e a mensagem do servidor", async () => {
    const { fn } = fetchFalso(409, { code: "session_terminee", message: "A sessão já terminou." });
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });

    await assert.rejects(client.envoyerMessage(tour.sessionId, "Encore"), (erreur) => {
      assert.ok(erreur instanceof ErreurApi);
      assert.equal(erreur.status, 409);
      assert.equal(erreur.code, "session_terminee");
      assert.equal(erreur.message, "A sessão já terminou.");
      assert.equal(erreur.temporaire, true);
      return true;
    });
  });

  it("envia a chave de acesso quando a tem", async () => {
    const { fn, appels } = fetchFalso(201, tour);
    const client = creerClientCamille({ baseUrl: "http://api.test", cleApi: "segredo", fetch: fn });

    await client.creerSession({ niveau: "A2", tache: "interaction", langueAppui: "uk" });

    assert.equal(
      (appels[0]?.init.headers as Record<string, string>).authorization,
      "Bearer segredo",
    );
  });

  it("deduz o código pelo status quando a resposta não o traz", async () => {
    const casos = [
      [400, "requete_invalide"],
      [401, "non_autorise"],
      [429, "trop_de_requetes"],
      [413, "audio_trop_long"],
      [422, "audio_vide"],
      [502, "service_indisponible"],
      [418, "inconnu"],
    ] as const;
    for (const [status, code] of casos) {
      const { fn } = fetchFalso(status, { statusCode: status, message: "Erro", code: "outro" });
      const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });
      await assert.rejects(client.terminer(tour.sessionId), { code });
    }
  });

  it("recusa respostas que não seguem o contrato", async () => {
    const { fn } = fetchFalso(200, { camille: 42 });
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });

    await assert.rejects(client.terminer(tour.sessionId), {
      code: "reponse_invalide",
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
      assert.equal(erreur.code, "reseau");
      assert.equal(erreur.message, "Sem ligação à API.");
      return true;
    });
  });

  it("distingue o tempo esgotado de uma falha de rede", async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    // fetch que só termina quando o pedido é cancelado.
    const fn = ((_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      })) as typeof fetch;
    const client = creerClientCamille({ baseUrl: "http://api.test", fetch: fn });

    const pedido = client.envoyerMessage(tour.sessionId, "Bonjour");
    t.mock.timers.tick(45_000);

    await assert.rejects(pedido, { status: 0, code: "delai" });
  });
});
