import type { LangueAppui } from "@camille/shared";
import { ar } from "./ar";
import { en } from "./en";
import { es } from "./es";
import { ptPT, type Textes } from "./pt-PT";

export type { Textes };

export const TEXTES: Record<LangueAppui, Textes> = { "pt-PT": ptPT, en, es, ar };
