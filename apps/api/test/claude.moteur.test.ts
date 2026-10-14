import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Anthropic from "@anthropic-ai/sdk";
import { ServiceUnavailableException } from "@nestjs/common";
import type { Conversation } from "../src/camille/camille.types";
import { ClaudeCamille } from "../src/camille/claude.moteur";
import { CONSIGNE_DERNIER_ECHANGE, REPLIQUE_DE_SECOURS } from "../src/camille/prompts";

type Params = Record<string, unknown> & { messages: Anthropic.Beta.BetaMessageParam[] };

/** Cliente falso: regista os pedidos e devolve as respostas preparadas, por ordem. */
function clientFalso(reponses: Array<object | Error>) {
  const appels: Params[] = [];
  const repondre = async (params: Params) => {
    // Copia as mensagens: o histórico continua a ser alterado depois do pedido.
    appels.push({ ...params, messages: structuredClone(params.messages) });
    const suivante = reponses.shift();
    if (suivante === undefined) throw new Error("Sem mais respostas preparadas.");
    if (suivante instanceof Error) throw suivante;
    return suivante;
  };
  const client = { beta: { messages: { create: repondre, parse: repondre } } };
  return { client: client as unknown as Anthropic, appels };
}

const message = (contenu: object[], stop_reason = "end_turn") => ({
  content: contenu,
  stop_reason,
});
const texte = (t: string) => ({ type: "text", text: t });
const reflexion = { type: "thinking", thinking: "", signature: "sig" };

const conversation = (): Conversation => ({
  contexte: { niveau: "A2", tache: "point_de_vue", langueAppui: "ar" },
  transcription: [],
  messagesModele: [],
});

describe("ClaudeCamille", () => {
  it("abre a sessão e guarda a resposta completa, incluindo o raciocínio", async () => {
    const { client, appels } = clientFalso([
      message([reflexion, texte("Bonjour ! Je suis Camille.")]),
    ]);
    const conv = conversation();

    const replique = await new ClaudeCamille(client, "claude-opus-5-5").ouvrir(conv);

    assert.equal(replique, "Bonjour ! Je suis Camille.");
    const [appel] = appels;
    assert.ok(appel);
    assert.equal(appel.model, "claude-opus-5-5");
    assert.equal(appel.fallbacks, "default");
    assert.deepEqual(appel.betas, ["server-side-fallback-2026-07-01"]);
    assert.deepEqual(appel.output_config, { effort: "low" });
    assert.match(String(appel.system), /Niveau visé : A2/);
    assert.match(String(appel.system), /arabe/);
    assert.deepEqual(conv.messagesModele, [
      { role: "user", content: "Bonjour." },
      { role: "assistant", content: [reflexion, texte("Bonjour ! Je suis Camille.")] },
    ]);
  });

  it("só acrescenta ao histórico, sem alterar mensagens anteriores", async () => {
    const { client, appels } = clientFalso([
      message([texte("Question 1 ?")]),
      message([texte("Merci, c'est terminé.")]),
    ]);
    const conv = conversation();
    const camille = new ClaudeCamille(client, "claude-opus-5-5");

    await camille.ouvrir(conv);
    const avant = structuredClone(conv.messagesModele);
    await camille.repondre(conv, "Je pense que oui.", true);

    assert.deepEqual(conv.messagesModele.slice(0, avant.length), avant);
    const dernierAppel = appels.at(-1);
    assert.ok(dernierAppel);
    assert.deepEqual(dernierAppel.messages.slice(-2), [
      { role: "user", content: "Je pense que oui." },
      { role: "system", content: CONSIGNE_DERNIER_ECHANGE },
    ]);
  });

  it("não altera a conversa quando a API falha", async () => {
    const { client } = clientFalso([new Anthropic.APIConnectionError({ message: "sem rede" })]);
    const conv = conversation();

    await assert.rejects(
      new ClaudeCamille(client, "claude-opus-5-5").ouvrir(conv),
      ServiceUnavailableException,
    );
    assert.deepEqual(conv.messagesModele, []);
  });

  it("usa uma fala de recurso quando o pedido é recusado", async () => {
    const { client } = clientFalso([message([], "refusal")]);
    const conv = conversation();

    const replique = await new ClaudeCamille(client, "claude-opus-5-5").ouvrir(conv);

    assert.equal(replique, REPLIQUE_DE_SECOURS);
    assert.equal(conv.messagesModele.at(-1)?.role, "assistant");
  });

  it("limita o feedback a 3 erros", async () => {
    const erreur = {
      titre: "à + le = au",
      ditParLEleve: "Je vais à le marché.",
      extraitErrone: "à le",
      formeCorrecte: "Je vais au marché.",
      extraitCorrige: "au",
      explication: "…",
    };
    const parsed_output = {
      niveauEstime: "A2",
      resume: "…",
      erreurs: [erreur, erreur, erreur, erreur],
      conseil: "…",
    };
    const { client, appels } = clientFalso([{ ...message([]), parsed_output }]);
    const conv = conversation();
    conv.transcription.push({ role: "eleve", texte: "Je vais à le marché." });

    const feedback = await new ClaudeCamille(client, "claude-opus-5-5").evaluer(conv);

    assert.equal(feedback.erreurs.length, 3);
    const [appel] = appels;
    assert.ok(appel);
    assert.match(String(appel.messages[0]?.content), /Élève : Je vais à le marché\./);
  });

  it("devolve 503 quando o feedback é recusado", async () => {
    const { client } = clientFalso([{ ...message([], "refusal"), parsed_output: null }]);

    await assert.rejects(
      new ClaudeCamille(client, "claude-opus-5-5").evaluer(conversation()),
      ServiceUnavailableException,
    );
  });
});
