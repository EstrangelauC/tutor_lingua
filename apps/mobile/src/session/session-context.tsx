import type { CreerSessionRequest, Feedback } from "@camille/shared";
import { createContext, use, useState, type ReactNode } from "react";

interface ValeurSession {
  /** Escolhas do ecrã inicial, usadas para criar (ou repetir) a sessão. */
  config: CreerSessionRequest;
  setConfig: (config: CreerSessionRequest) => void;
  /** Feedback da última sessão terminada. */
  feedback: Feedback | null;
  setFeedback: (feedback: Feedback | null) => void;
}

const ContexteSession = createContext<ValeurSession | null>(null);

const CONFIG_INITIALE: CreerSessionRequest = {
  niveau: "B1",
  tache: "entretien",
  langueAppui: "pt-PT",
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(CONFIG_INITIALE);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  return (
    <ContexteSession value={{ config, setConfig, feedback, setFeedback }}>
      {children}
    </ContexteSession>
  );
}

export function useContexteSession(): ValeurSession {
  const valeur = use(ContexteSession);
  if (!valeur) {
    throw new Error("useContexteSession tem de ser usado dentro de <SessionProvider>.");
  }
  return valeur;
}
