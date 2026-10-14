import type { Feedback, LangueAppui, Tache } from "@camille/shared";
import type { Conversation, MoteurCamille } from "./camille.types";

const OUVERTURES: Record<Tache, string> = {
  entretien:
    "Bonjour ! Je m'appelle Camille. Pour commencer, pouvez-vous vous présenter, s'il vous plaît ?",
  interaction:
    "Bonjour ! Je m'appelle Camille. Imaginons que vous cherchez un appartement et que je suis l'agente immobilière. Quelles questions voulez-vous me poser ?",
  point_de_vue:
    "Bonjour ! Je m'appelle Camille. Aujourd'hui, nous parlons du télétravail. Selon vous, est-ce une bonne idée ?",
};

const RELANCES: Record<Tache, readonly string[]> = {
  entretien: [
    "Très bien. Où habitez-vous et depuis combien de temps ?",
    "Qu'est-ce que vous faites pendant votre temps libre ?",
    "Parlez-moi de votre travail ou de vos études.",
    "Pourquoi avez-vous choisi de vivre en France ?",
    "Quels sont vos projets pour les prochaines années ?",
  ],
  interaction: [
    "L'appartement fait cinquante mètres carrés. Vous avez d'autres questions ?",
    "Le loyer est de huit cents euros par mois, charges comprises. Autre chose ?",
    "Il est libre à partir du premier du mois prochain. Que voulez-vous savoir encore ?",
    "Oui, il y a une station de métro à cinq minutes. Une dernière question ?",
  ],
  point_de_vue: [
    "Pourquoi pensez-vous cela ?",
    "Pouvez-vous me donner un exemple ?",
    "Certaines personnes disent que le télétravail isole. Qu'en pensez-vous ?",
    "Et pour les entreprises, quels sont les avantages ?",
  ],
};

const CLOTURE = "Merci beaucoup, c'était un bel échange. L'épreuve est maintenant terminée.";

const TEXTES_FEEDBACK: Record<
  LangueAppui,
  { resume: string; explication: string; conseil: string }
> = {
  "pt-PT": {
    resume: "Simulação: a tua conversa não foi analisada.",
    explication: "Depois de « si », usa-se o imparfait, nunca o conditionnel.",
    conseil: "Define a ANTHROPIC_API_KEY na API para receberes o feedback real da Camille.",
  },
  en: {
    resume: "Simulation: your conversation was not analysed.",
    explication: "After « si », use the imparfait, never the conditionnel.",
    conseil: "Set ANTHROPIC_API_KEY on the API to get Camille's real feedback.",
  },
  es: {
    resume: "Simulación: tu conversación no se ha analizado.",
    explication: "Después de « si » se usa el imparfait, nunca el conditionnel.",
    conseil: "Define ANTHROPIC_API_KEY en la API para recibir el feedback real de Camille.",
  },
  ar: {
    resume: "محاكاة: لم يتم تحليل محادثتك.",
    explication: "بعد « si » نستعمل الـ imparfait، وليس الـ conditionnel أبدًا.",
    conseil: "اضبط ANTHROPIC_API_KEY في الـ API لتحصل على ملاحظات كامي الحقيقية.",
  },
};

/** Camille sem modelo: falas fixas, para desenvolver e testar sem chave nem custos. */
export class CamilleSimulee implements MoteurCamille {
  readonly nom = "simulação";

  async ouvrir(conversation: Conversation): Promise<string> {
    return OUVERTURES[conversation.contexte.tache];
  }

  async repondre(
    conversation: Conversation,
    _texteEleve: string,
    derniere: boolean,
  ): Promise<string> {
    if (derniere) {
      return CLOTURE;
    }
    const relances = RELANCES[conversation.contexte.tache];
    const dejaPosees = conversation.transcription.filter((r) => r.role === "eleve").length;
    return relances[dejaPosees % relances.length] ?? CLOTURE;
  }

  async evaluer(conversation: Conversation): Promise<Feedback> {
    const textes = TEXTES_FEEDBACK[conversation.contexte.langueAppui];
    return {
      niveauEstime: conversation.contexte.niveau,
      resume: textes.resume,
      erreurs: [
        {
          titre: "si + imparfait",
          ditParLEleve: "Si j'aurais plus de temps, je ferais du sport.",
          extraitErrone: "j'aurais",
          formeCorrecte: "Si j'avais plus de temps, je ferais du sport.",
          extraitCorrige: "j'avais",
          explication: textes.explication,
        },
      ],
      conseil: textes.conseil,
    };
  }
}
