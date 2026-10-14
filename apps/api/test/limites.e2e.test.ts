import "reflect-metadata";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import { TourCamilleSchema } from "@camille/shared";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

describe("proteção da API: limite geral de pedidos por IP", () => {
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

  before(async () => {
    Object.assign(process.env, {
      LIMITE_REQUETES_PAR_MINUTE: "4",
      LIMITE_SESSIONS_PAR_HEURE: "100",
    });
    const { AppModule } = await import("../src/app.module.js");
    const { MOTEUR_CAMILLE } = await import("../src/camille/camille.types.js");
    const { CamilleSimulee } = await import("../src/camille/simulee.moteur.js");
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

  it("devolve 429 a partir do pedido a mais, e /health continua a responder", async () => {
    const creation = await post("/sessions", {
      niveau: "A2",
      tache: "interaction",
      langueAppui: "ro",
    });
    assert.equal(creation.status, 201);
    const { sessionId } = TourCamilleSchema.parse(creation.json);

    for (let i = 0; i < 3; i++) {
      const reponse = await post(`/sessions/${sessionId}/messages`, { texte: `Réponse ${i + 1}.` });
      assert.equal(reponse.status, 200, `pedido ${i + 2}`);
    }
    const deTrop = await post(`/sessions/${sessionId}/messages`, { texte: "Encore ?" });
    assert.equal(deTrop.status, 429);
    assert.equal((deTrop.json as { code?: string }).code, "trop_de_requetes");

    const sante = await fetch(`${base}/health`);
    assert.equal(sante.status, 200);
  });
});
