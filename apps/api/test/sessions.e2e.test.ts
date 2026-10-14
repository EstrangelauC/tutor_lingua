import "reflect-metadata";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import { FeedbackSchema, MAX_ECHANGES, TourCamilleSchema } from "@camille/shared";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { MOTEUR_CAMILLE } from "../src/camille/camille.types";
import { CamilleSimulee } from "../src/camille/simulee.moteur";

describe("API de sessões (Camille simulada)", () => {
  let app: INestApplication;
  let base: string;

  const post = async (chemin: string, corps?: unknown) => {
    const response = await fetch(`${base}${chemin}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: corps === undefined ? undefined : JSON.stringify(corps),
    });
    return { status: response.status, json: (await response.json()) as unknown };
  };

  const creer = () => post("/sessions", { niveau: "B1", tache: "entretien", langueAppui: "pt-PT" });

  before(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MOTEUR_CAMILLE)
      .useValue(new CamilleSimulee())
      .compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, "127.0.0.1");
    const { port } = app.getHttpServer().address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await app.close();
  });

  it("percorre uma sessão completa até ao feedback", async () => {
    const ouverture = await creer();
    assert.equal(ouverture.status, 201);
    const premier = TourCamilleSchema.parse(ouverture.json);
    assert.equal(premier.echange, 0);
    assert.equal(premier.maxEchanges, MAX_ECHANGES);
    assert.equal(premier.terminee, false);
    assert.match(premier.camille, /Camille/);

    for (let i = 1; i <= MAX_ECHANGES; i++) {
      const reponse = await post(`/sessions/${premier.sessionId}/messages`, {
        texte: `Réponse numéro ${i}.`,
      });
      assert.equal(reponse.status, 200);
      const tour = TourCamilleSchema.parse(reponse.json);
      assert.equal(tour.echange, i);
      assert.equal(tour.terminee, i === MAX_ECHANGES);
    }

    const deTrop = await post(`/sessions/${premier.sessionId}/messages`, { texte: "Encore ?" });
    assert.equal(deTrop.status, 409);

    const fin = await post(`/sessions/${premier.sessionId}/terminer`);
    assert.equal(fin.status, 200);
    const feedback = FeedbackSchema.parse(fin.json);
    assert.ok(feedback.erreurs.length <= 3);

    const encore = await post(`/sessions/${premier.sessionId}/terminer`);
    assert.deepEqual(encore.json, fin.json);
  });

  it("permite terminar a meio da sessão", async () => {
    const { sessionId } = TourCamilleSchema.parse((await creer()).json);
    await post(`/sessions/${sessionId}/messages`, { texte: "Je m'appelle Nour." });

    const fin = await post(`/sessions/${sessionId}/terminer`);
    assert.equal(fin.status, 200);
    FeedbackSchema.parse(fin.json);

    const apres = await post(`/sessions/${sessionId}/messages`, { texte: "Et maintenant ?" });
    assert.equal(apres.status, 409);
  });

  it("recusa pedidos inválidos com 400", async () => {
    const niveau = await post("/sessions", {
      niveau: "C1",
      tache: "entretien",
      langueAppui: "pt-PT",
    });
    assert.equal(niveau.status, 400);

    const { sessionId } = TourCamilleSchema.parse((await creer()).json);
    const vide = await post(`/sessions/${sessionId}/messages`, { texte: "   " });
    assert.equal(vide.status, 400);

    const pasUnUuid = await post("/sessions/abc/messages", { texte: "Bonjour" });
    assert.equal(pasUnUuid.status, 400);
  });

  it("devolve 404 para uma sessão desconhecida", async () => {
    const inconnue = await post(`/sessions/${crypto.randomUUID()}/messages`, { texte: "Bonjour" });
    assert.equal(inconnue.status, 404);
  });

  it("não gera feedback sem respostas do aluno", async () => {
    const { sessionId } = TourCamilleSchema.parse((await creer()).json);
    const fin = await post(`/sessions/${sessionId}/terminer`);
    assert.equal(fin.status, 409);
  });
});
