import "reflect-metadata";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { LangueAppuiSchema, MAX_ECHANGES, NiveauSchema, TacheSchema } from "@camille/shared";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { MOTEUR_CAMILLE, type MoteurCamille } from "../camille/camille.types";
import type { Env } from "../config/env";
import { EleveModele, EleveScripte } from "./eleves";
import { jouerEssai, rapportEnMarkdown, type Eleve } from "./session-essai";

/**
 * Joga uma sessão inteira com a Camille (real, se houver ANTHROPIC_API_KEY no .env; senão a
 * simulada) e escreve o relatório em essais/. Serve para afinar os prompts sem tocar na app:
 *   pnpm --filter @camille/api essai -- --niveau B1 --tache entretien --langue pt-PT --eleve modele
 */
async function main(): Promise<void> {
  // O pnpm passa um "--" literal ao script: ignora-o para `pnpm … essai -- --niveau B1` também funcionar.
  const args = process.argv.slice(2).filter((arg, i) => !(i === 0 && arg === "--"));
  const { values } = parseArgs({
    args,
    options: {
      niveau: { type: "string", default: "B1" },
      tache: { type: "string", default: "entretien" },
      langue: { type: "string", default: "pt-PT" },
      eleve: { type: "string", default: "script" },
      echanges: { type: "string", default: String(MAX_ECHANGES) },
      sortie: { type: "string" },
    },
  });
  const contexte = {
    niveau: NiveauSchema.parse(values.niveau),
    tache: TacheSchema.parse(values.tache),
    langueAppui: LangueAppuiSchema.parse(values.langue),
  };
  const echanges = Number.parseInt(values.echanges, 10);
  if (!Number.isInteger(echanges) || echanges < 1 || echanges > MAX_ECHANGES) {
    throw new Error(`--echanges tem de estar entre 1 e ${MAX_ECHANGES}.`);
  }

  // O AppModule lê e valida o .env e escolhe o motor, como a API a correr.
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["warn", "error"] });
  try {
    const moteur = app.get<MoteurCamille>(MOTEUR_CAMILLE);
    const config = app.get<ConfigService<Env, true>>(ConfigService);

    let eleve: Eleve;
    if (values.eleve === "modele") {
      const apiKey = config.get("ANTHROPIC_API_KEY", { infer: true });
      if (apiKey === undefined) {
        throw new Error("--eleve modele precisa de ANTHROPIC_API_KEY no apps/api/.env.");
      }
      eleve = new EleveModele(
        new Anthropic({ apiKey }),
        config.get("ANTHROPIC_MODEL", { infer: true }),
        contexte.niveau,
        contexte.langueAppui,
      );
    } else if (values.eleve === "script") {
      eleve = new EleveScripte(contexte.tache, contexte.niveau);
    } else {
      throw new Error(`--eleve: "script" ou "modele", não "${values.eleve}".`);
    }

    console.log(
      `Ensaio ${contexte.niveau} · ${contexte.tache} · ${contexte.langueAppui} — motor ${moteur.nom}, aluno ${eleve.nom}, ${echanges} trocas…`,
    );
    const rapport = await jouerEssai({ moteur, eleve, contexte, echanges });
    const markdown = rapportEnMarkdown(rapport);

    const horodatage = rapport.date.replace(/[:.]/g, "-").slice(0, 19);
    const fichier =
      values.sortie ??
      join("essais", `${horodatage}-${contexte.niveau}-${contexte.tache}-${moteur.nom}.md`);
    mkdirSync(join(fichier, ".."), { recursive: true });
    writeFileSync(fichier, markdown);

    console.log(`\n${markdown}\nRelatório guardado em ${fichier}`);
  } finally {
    await app.close();
  }
}

main().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exitCode = 1;
});
