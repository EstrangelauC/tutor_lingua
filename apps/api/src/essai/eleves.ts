import Anthropic from "@anthropic-ai/sdk";
import type { LangueAppui, Niveau, Tache } from "@camille/shared";
import { NOMS_LANGUES } from "../camille/prompts";
import type { Eleve } from "./session-essai";

/**
 * Respostas fixas por tarefa e nível, com os erros típicos de cada nível. Servem para a
 * Camille simulada (cujas perguntas são fixas) e para fumar o circuito; com a Camille real,
 * as perguntas variam e o aluno-modelo (EleveModele) é mais fiel.
 */
const GUIONS: Record<Tache, Record<Niveau, readonly string[]>> = {
  entretien: {
    A2: [
      "Je m'appelle Nour. Je suis de Maroc, je habite à Lyon depuis deux ans.",
      "J'habite avec mon mari et mes deux enfants. Ma fille elle a six ans et mon fils a trois ans.",
      "Je travaille dans un restaurant, je suis cuisinier. Avant, dans mon pays, je suis vendeur.",
      "Le week-end, je fais la cuisine et je vais au parc avec les enfants. J'aime beaucoup le football.",
      "Je suis venu en France parce que mon mari il travaille ici. C'est difficile au début, mais maintenant ça va.",
      "Le matin, je réveille à six heures, je prépare les enfants et après je vais au travail en bus.",
      "Mon pays me manque, surtout ma famille. Je téléphone ma mère tous les jours.",
      "Dans le futur, je veux ouvrir un petit restaurant et je veux que mes enfants ils étudient bien.",
    ],
    B1: [
      "Bonjour. Je m'appelle Nour, j'ai trente-deux ans et j'habite à Lyon depuis deux ans avec ma famille.",
      "Nous sommes quatre à la maison : mon mari, mes deux enfants et moi. Les enfants vont à l'école près de chez nous.",
      "Je travaille comme cuisinière dans un restaurant italien. C'est fatigant mais j'aime beaucoup l'ambiance de la cuisine.",
      "Pendant mon temps libre, je fais la cuisine et je marche au parc. Si j'aurais plus de temps, je ferais du sport.",
      "Nous avons choisi la France parce que mon mari a trouvé un travail ici. Au début c'était dur, surtout pour la langue.",
      "Une journée normale, je me lève à six heures, j'amène les enfants à l'école et je vais à le travail en bus.",
      "L'année dernière, nous sommes allés à Marseille pour les vacances. Les enfants ont adoré la mer.",
      "Mon projet, c'est de passer le diplôme pour devenir chef. Il faut que je vais à une formation l'année prochaine.",
    ],
    B2: [
      "Bonjour. Je m'appelle Nour, je suis d'origine marocaine et je vis à Lyon depuis un peu plus de deux ans avec mon mari et nos deux enfants.",
      "Nos enfants sont scolarisés dans le quartier, ce qui nous a beaucoup aidés à nous intégrer : on connaît maintenant les autres parents.",
      "Je suis cuisinière dans un restaurant italien. Ce que j'apprécie le plus, c'est le travail en équipe, même si les horaires sont contraignants.",
      "Le week-end, j'essaie de décrocher : je cuisine pour le plaisir, je marche beaucoup. Bien que je sois fatiguée, j'aime garder une activité physique.",
      "Nous nous sommes installés en France pour le travail de mon mari, mais aussi pour les enfants, afin qu'ils aient plus d'opportunités.",
      "Mes journées sont bien remplies : je dépose les enfants à l'école, puis je rejoins le restaurant pour le service de midi et du soir.",
      "L'an dernier, nous avons visité Marseille. Les enfants ont adoré la mer, et moi j'ai été touché par la diversité de la ville.",
      "À moyen terme, j'aimerais obtenir un diplôme de chef et, pourquoi pas, ouvrir mon propre établissement, si les conditions le permettent.",
    ],
  },
  interaction: {
    A2: [
      "Bonjour madame. Je cherche un appartement. Il y a combien de chambres ?",
      "C'est combien le loyer ?",
      "Les charges sont inclus ou pas ?",
      "L'appartement est libre quand ?",
      "Il y a un métro ou un bus près de l'appartement ?",
      "Je peux visiter cette semaine ? Je suis libre le mardi.",
      "Pour les documents, je dois apporter quoi ?",
      "D'accord, merci beaucoup. Je vais parler avec mon mari.",
    ],
    B1: [
      "Bonjour madame. Je vous appelle pour l'appartement que j'ai vu sur l'annonce. Est-ce qu'il est encore disponible ?",
      "Combien de chambres il y a ? Nous sommes une famille avec deux enfants.",
      "Et le loyer, il est de combien par mois ? Est-ce que les charges sont comprises ?",
      "Est-ce qu'il y a une école et des transports près de l'appartement ?",
      "À partir de quand on peut emménager ?",
      "Je voudrais le visiter. Est-ce que c'est possible samedi matin ?",
      "Quels documents je dois apporter pour le dossier ? Il faut que je prends mes fiches de paie ?",
      "Très bien, merci pour les informations. Je vous rappelle demain pour confirmer.",
    ],
    B2: [
      "Bonjour madame. Je vous contacte au sujet de l'appartement de l'annonce : pourriez-vous me dire s'il est toujours disponible ?",
      "Nous sommes une famille de quatre personnes. Combien de chambres compte-t-il, et quelle est la surface ?",
      "Quel est le montant du loyer, charges comprises ? Et y a-t-il des frais d'agence à prévoir ?",
      "Le quartier est-il bien desservi par les transports ? Je travaille en centre-ville et je n'ai pas de voiture.",
      "À quelle date l'appartement se libère-t-il ? Nous devons quitter notre logement actuel à la fin du mois prochain.",
      "Serait-il possible de le visiter ce week-end ? Je suis disponible samedi dans la matinée.",
      "Quelles pièces faut-il fournir pour le dossier ? J'ai un CDI, mais mon mari est en période d'essai : est-ce que cela pose problème ?",
      "Parfait, je vous remercie. Je vous recontacterai demain pour vous confirmer la visite.",
    ],
  },
  point_de_vue: {
    A2: [
      "Oui, je pense que c'est une bonne idée. Avec le télétravail, on reste à la maison et on est plus tranquille.",
      "Parce que on perd pas de temps dans les transports. Moi, je prends le bus une heure chaque jour.",
      "Par exemple, mon amie elle travaille à la maison et elle peut chercher ses enfants à l'école.",
      "C'est vrai, des fois c'est triste de rester seul. Mais on peut sortir le soir avec les amis.",
      "Pour les entreprises, c'est moins cher. Ils paient pas les bureaux grands.",
      "Dans mon travail, c'est pas possible. Je suis cuisinier, je dois être dans le restaurant.",
      "Je pense que deux jours à la maison et trois jours au bureau, c'est bien.",
      "Oui, je suis d'accord. C'est bien pour la famille et pour le temps.",
    ],
    B1: [
      "À mon avis, c'est une bonne idée, parce qu'on gagne du temps et on est plus calme pour travailler.",
      "Par exemple, mon frère travaille de chez lui deux jours par semaine et il dit qu'il est moins stressé.",
      "C'est vrai que certaines personnes se sentent seules. Mais on peut organiser des réunions au bureau une fois par semaine.",
      "Pour les entreprises, je pense qu'elles économisent de l'argent, parce qu'elles ont besoin de moins de bureaux.",
      "Mais ce n'est pas possible pour tous les métiers. Si j'aurais un travail de bureau, je choisirais le télétravail.",
      "Le problème, c'est que la maison est petite et les enfants font du bruit. Il faut avoir une pièce calme.",
      "Je crois que le mieux, c'est de mélanger : quelques jours à la maison et quelques jours au bureau.",
      "Pour conclure, je dirais que le télétravail est positif, mais il faut que les entreprises organisent bien.",
    ],
    B2: [
      "Je pense que le télétravail est globalement une bonne chose, à condition qu'il reste un choix et non une obligation.",
      "D'abord, il permet de gagner un temps précieux : les trajets quotidiens sont fatigants et coûteux, surtout dans les grandes villes.",
      "Je reconnais que l'isolement est un vrai risque. Cependant, il peut être limité par des jours de présence réguliers au bureau.",
      "Pour les entreprises, l'avantage est double : des locaux moins coûteux et des salariés souvent plus concentrés, donc plus productifs.",
      "Cela dit, tous les métiers ne s'y prêtent pas. Dans la restauration, par exemple, la présence physique est évidemment indispensable.",
      "Il y a aussi une question d'équité : ceux qui ont un logement spacieux en profitent davantage que ceux qui vivent dans un studio.",
      "À mon sens, la formule hybride est la plus équilibrée, bien qu'elle demande une organisation rigoureuse de la part des équipes.",
      "En conclusion, je dirais que le télétravail est une évolution positive, pourvu que les entreprises en fixent des règles claires et équitables.",
    ],
  },
};

/** Aluno com guião: responde pela ordem, e recomeça se a sessão tiver mais trocas do que frases. */
export class EleveScripte implements Eleve {
  readonly nom: string;
  private tour = 0;

  constructor(
    private readonly tache: Tache,
    private readonly niveau: Niveau,
  ) {
    this.nom = `guião ${niveau}`;
  }

  async repondre(): Promise<string> {
    const guion = GUIONS[this.tache][this.niveau];
    const texte = guion[this.tour % guion.length] ?? "";
    this.tour += 1;
    return texte;
  }
}

const ERREURS_TYPIQUES: Record<Niveau, string> = {
  A2: "oubli d'articles et de prépositions, verbes mal conjugués, « je suis » au lieu de « j'ai », mots de ta langue maternelle quand tu ne sais pas",
  B1: "« si j'aurais », « à le », accords du genre, subjonctif oublié après « il faut que », mot de passe pour les temps du passé",
  B2: "rares : un accord oublié, une préposition hésitante, un anglicisme",
};

/** Aluno jogado pelo modelo, com o nível e a língua materna pedidos. Precisa da chave da Anthropic. */
export class EleveModele implements Eleve {
  readonly nom: string;
  private readonly historique: Anthropic.MessageParam[] = [];

  constructor(
    private readonly client: Anthropic,
    private readonly model: string,
    private readonly niveau: Niveau,
    private readonly langue: LangueAppui,
  ) {
    this.nom = `modèle ${niveau}`;
  }

  async repondre(derniereCamille: string): Promise<string> {
    this.historique.push({ role: "user", content: derniereCamille });
    const reponse = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      system: `Tu joues un candidat au TCF IRN pendant une session d'entraînement à l'oral. Ton niveau réel de français est ${this.niveau} (CECRL) et ta langue maternelle est le ${NOMS_LANGUES[this.langue]}. L'examinatrice s'appelle Camille.
Tu réponds en français, à l'oral, en une à trois phrases, sans listes ni markdown. Tu fais les erreurs typiques d'un apprenant de niveau ${this.niveau} (${ERREURS_TYPIQUES[this.niveau]}), sans exagérer ni te corriger. Tu ne joues jamais l'examinatrice et tu ne commentes pas l'exercice : tu réponds simplement à ce qu'on te demande, avec un peu de contenu personnel inventé et cohérent d'une réplique à l'autre.`,
      messages: this.historique,
    });
    const texte = reponse.content
      .map((bloc) => (bloc.type === "text" ? bloc.text : ""))
      .join("")
      .trim();
    this.historique.push({ role: "assistant", content: texte });
    return texte;
  }
}
