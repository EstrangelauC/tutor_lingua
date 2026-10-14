import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";
import OpenAI from "openai";
import { OpenAiTranscripteur } from "../src/transcription/openai.transcripteur";

/** Cliente falso: regista o pedido de transcrição e devolve `resultat` (ou lança-o, se for um erro). */
function clientFalso(resultat: { text: string } | Error) {
  const appels: Array<Record<string, unknown>> = [];
  const client = {
    audio: {
      transcriptions: {
        create: async (params: Record<string, unknown>) => {
          appels.push(params);
          if (resultat instanceof Error) throw resultat;
          return resultat;
        },
      },
    },
  };
  return { client: client as unknown as OpenAI, appels };
}

const audio = {
  contenu: Buffer.from("..."),
  typeMime: "audio/mp4",
  nomFichier: "resposta.m4a",
};

describe("OpenAiTranscripteur", () => {
  it("pede uma transcrição em francês, literal, com o modelo configurado", async () => {
    const { client, appels } = clientFalso({ text: "  Si j'aurais le temps.  " });

    const texte = await new OpenAiTranscripteur(client, "gpt-4o-transcribe").transcrire(audio);

    assert.equal(texte, "Si j'aurais le temps.");
    const [appel] = appels;
    assert.ok(appel);
    assert.equal(appel.model, "gpt-4o-transcribe");
    assert.equal(appel.language, "fr");
    assert.match(String(appel.prompt), /sans les corriger/);
    const fichier = appel.file as File;
    assert.equal(fichier.name, "resposta.m4a");
    assert.equal(fichier.type, "audio/mp4");
  });

  it("devolve 503 quando o serviço está indisponível", async () => {
    const { client } = clientFalso(new OpenAI.APIConnectionError({ message: "sem rede" }));

    await assert.rejects(
      new OpenAiTranscripteur(client, "gpt-4o-transcribe").transcrire(audio),
      ServiceUnavailableException,
    );
  });
});
