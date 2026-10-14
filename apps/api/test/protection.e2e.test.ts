import "reflect-metadata";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

const CLE = "chave-de-teste-0123456789";
const SESSION = { niveau: "B1", tache: "entretien", langueAppui: "uk" };

describe("proteção da API: chave de acesso e limite de sessões", () => {
  let app: INestApplication;
  let base: string;

  const post = async (chemin: string, corps?: unknown, cle?: string) => {
    const response = await fetch(`${base}${chemin}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cle === undefined ? {} : { authorization: `Bearer ${cle}` }),
      },
      body: corps === undefined ? undefined : JSON.stringify(corps),
    });
    return { status: response.status, json: (await response.json()) as { code?: string } };
  };

  before(async () => {
    Object.assign(process.env, {
      CAMILLE_API_KEY: CLE,
      LIMITE_SESSIONS_PAR_HEURE: "5",
      LIMITE_REQUETES_PAR_MINUTE: "100",
    });
    // O .env é validado quando o AppModule é importado: só depois de definir as variáveis.
    const { AppModule } = await import("../src/app.module.js");
    const { MOTEUR_CAMILLE } = await import("../src/camille/camille.types.js");
    const { CamilleSimulee } = await import("../src/camille/simulee.moteur.js");
    const { TRANSCRIPTEUR } = await import("../src/transcription/transcripteur.js");
    const { TranscripteurSimule } = await import("../src/transcription/simule.transcripteur.js");
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MOTEUR_CAMILLE)
      .useValue(new CamilleSimulee())
      .overrideProvider(TRANSCRIPTEUR)
      .useValue(new TranscripteurSimule())
      .compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, "127.0.0.1");
    const { port } = app.getHttpServer().address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await app.close();
  });

  it("/health responde sem chave", async () => {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
  });

  it("recusa pedidos sem chave ou com a chave errada", async () => {
    const sans = await post("/sessions", SESSION);
    assert.equal(sans.status, 401);
    assert.equal(sans.json.code, "non_autorise");

    const mauvaise = await post("/sessions", SESSION, "chave-errada-0123456789");
    assert.equal(mauvaise.status, 401);
    assert.equal(mauvaise.json.code, "non_autorise");
  });

  it("aceita a chave certa e limita as sessões criadas por IP", async () => {
    // As duas tentativas sem chave do teste anterior já contaram: o limitador corre antes
    // da chave, para também travar quem a tenta adivinhar.
    for (let i = 0; i < 3; i++) {
      const creation = await post("/sessions", SESSION, CLE);
      assert.equal(creation.status, 201, `sessão ${i + 1}`);
    }
    const deTrop = await post("/sessions", SESSION, CLE);
    assert.equal(deTrop.status, 429);
    assert.equal(deTrop.json.code, "trop_de_requetes");
  });
});
