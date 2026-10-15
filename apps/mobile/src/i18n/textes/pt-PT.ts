/**
 * Textos da interface em português europeu. Este dicionário define a forma de todos os
 * outros (ver `Textes`). Os nomes das tarefas, «Tâche n» e tudo o que a Camille diz ficam
 * em francês e não passam por aqui.
 */
export const ptPT = {
  marqueSous: "Oral TCF IRN",
  communs: {
    retour: "Voltar",
    annuler: "Cancelar",
    tu: "Tu",
  },
  onglets: {
    accueil: "Início",
    historique: "Histórico",
    definitions: "Definições",
  },
  taches: {
    entretien: {
      description: "Apresentar-te: quem és, a tua vida, os teus planos.",
      resume: "Falar de ti",
    },
    interaction: {
      description: "Pedir informações ou resolver uma situação do dia a dia.",
      resume: "Resolver uma situação",
    },
    point_de_vue: {
      description: "Dar a tua opinião e defendê-la com exemplos.",
      resume: "Dar e defender uma opinião",
    },
  },
  niveaux: {
    A2: "Elementar",
    B1: "Intermédio",
    B2: "Intermédio superior",
  },
  quand: (jours: number) => (jours <= 0 ? "hoje" : jours === 1 ? "ontem" : `há ${jours} dias`),
  duree: (minutes: number) =>
    minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`,
  accueil: {
    bonjour: "Olá",
    bonjourRetour: "Olá de novo",
    titre: "Vamos praticar?",
    objectif: (niveau: string) => `Objetivo ${niveau}`,
    objectifAide: "Alterar o nível alvo nas definições",
    continuer: "Continuar a praticar",
    derniereFois: (niveau: string, quand: string) => `última vez ${niveau}, ${quand}`,
    reprendre: "Retomar",
    choisir: "Escolhe uma tarefa",
    commencerAide: "Começa uma sessão com a Camille",
    dernierNiveau: (niveau: string) => `Último nível estimado: ${niveau}`,
    francais: "A conversa com a Camille é sempre em francês.",
  },
  session: {
    terminer: "Terminar",
    texte: "Texto",
    transcription: "Transcrição",
    afficherTranscription: "Mostrar transcrição",
    masquerTranscription: "Ocultar transcrição",
    echange: (n: number, total: number) => `Troca ${n} de ${total}`,
    progression: "Progresso da sessão",
    statuts: {
      demarrage: "A Camille está a preparar-se…",
      reponse: "A Camille está a pensar…",
      evaluation: "A Camille está a preparar o teu feedback…",
      ecoute: "A ouvir-te…",
      parle: "A Camille está a falar",
      terminee: "Sessão terminada",
      aToi: "É a tua vez",
      sansSession: "Sem sessão",
    },
    reecouter: "Ouvir outra vez",
    aide: "Sem correções durante o exercício. O feedback chega no fim.",
    reessayer: "Tentar outra vez",
    voirFeedback: "Ver o feedback",
    modes: {
      maintenir: "Premir para falar",
      mainsLibres: "Mãos-livres",
    },
    micro: {
      attente: "Um momento…",
      relacher: "Solta para enviar",
      toucherEnvoyer: "Toca para enviar (ou faz uma pausa)",
      maintenir: "Mantém premido para falar",
      toucher: "Toca para falar",
      espace: "ou a tecla Espaço",
    },
    ecrire: "Escrever a resposta",
    repondreVoix: "Responder com a voz",
    champ: "A tua resposta em francês",
    placeholder: "Escreve a tua resposta em francês…",
    envoyer: "Enviar",
    microRefuse: {
      titre: "A Camille não te consegue ouvir",
      texte:
        "O acesso ao microfone foi recusado. Podes responder por escrito ou ativar o microfone nas definições.",
      ouvrir: "Abrir definições",
    },
  },
  orbe: {
    parle: "A Camille está a falar",
    ecoute: "A Camille está a ouvir-te",
    pense: "A Camille está a pensar",
    attend: "Camille",
  },
  feedback: {
    titre: "Feedback da sessão",
    niveauEstime: "Nível estimado",
    echelle: (estime: string, cible: string) =>
      `Escala de A1 a B2: ${estime} estimado, ${cible} objetivo`,
    objectif: "objetivo",
    note: "Estimativa com base nesta sessão. Não é uma nota oficial do TCF.",
    corrections: "As correções mais importantes",
    sansErreur: "Sem erros importantes nesta sessão",
    ceQueTuAsDit: "O que disseste",
    formeCorrecte: "Forma correta",
    ecouter: "Ouvir",
    prochaine: "Para a próxima sessão",
    repeter: "Repetir esta tarefa",
    nouvelle: "Nova tarefa",
    introuvable: "Esta sessão já não está no histórico.",
  },
  historique: {
    titre: "Histórico",
    sousTitre: "O teu progresso na prova oral",
    sessions: "Sessões",
    temps: "Tempo de prática",
    objectif: "Objetivo",
    evolution: "Evolução do nível estimado",
    dernieres: (n: number, niveau: string) =>
      n === 1
        ? `A tua primeira sessão · nível ${niveau}`
        : `Últimas ${n} sessões · último nível ${niveau}`,
    graphique: (niveaux: string) =>
      `Níveis estimados, da sessão mais antiga para a mais recente: ${niveaux}`,
    toutes: "Todas",
    ligne: (minutes: number, echanges: number) =>
      `${minutes} min · ${echanges} ${echanges === 1 ? "troca" : "trocas"}`,
    aucunePourTache: "Ainda não fizeste esta tarefa.",
    vide: {
      titre: "Ainda não tens sessões",
      texte:
        "Faz a tua primeira conversa com a Camille. São cerca de 6 minutos e, no fim, vês aqui o teu nível estimado e a tua evolução.",
      graphique: "O teu gráfico de evolução aparece aqui.",
      commencer: "Começar a primeira sessão",
    },
  },
  definitions: {
    titre: "Definições",
    langues: "Línguas",
    interface: "Interface",
    appui: "Apoio (feedback)",
    appuiAide:
      "A conversa com a Camille é sempre em francês. O feedback e as explicações chegam na língua de apoio.",
    pratique: "Prática",
    niveau: "Nível alvo",
    vitesse: "Velocidade da voz da Camille",
    vitesses: {
      lente: "Lenta",
      normale: "Normal",
      naturelle: "Natural",
    },
    ecouterExemple: "Ouvir exemplo",
    micro: "Modo do microfone",
    microAide: {
      maintenir: "Mantém o botão premido enquanto falas. Ideal em sítios com ruído.",
      mainsLibres: "O microfone abre sozinho quando a Camille termina. Ideal com auriculares.",
    },
    apparence: "Aparência",
    theme: "Tema",
    themes: {
      clair: "Claro",
      sombre: "Escuro",
      systeme: "Sistema",
    },
    donnees: "Privacidade e dados",
    donneesTexte:
      "As preferências e o histórico ficam só neste aparelho. As gravações são enviadas para transcrição e não ficam guardadas.",
    effacer: "Apagar histórico",
    effacerQuestion: (n: number) =>
      n === 1 ? "Apagar 1 sessão do histórico?" : `Apagar ${n} sessões do histórico?`,
    effacerConfirmer: "Apagar",
    efface: "Histórico apagado.",
    apropos: "Sobre a prova TCF IRN",
    aproposTexte:
      "O TCF IRN é o teste de francês pedido em França para a residência e a nacionalidade. A prova oral tem três tarefas: entretien, interaction e point de vue. Em regra, o cartão plurianual pede A2, o cartão de residente B1 e a nacionalidade B2; confirma os requisitos atuais em service-public.fr. As estimativas da Camille não substituem a prova oficial.",
    serveur: (adresse: string) => `Servidor: ${adresse}`,
  },
  onboarding: {
    etape: (n: number, total: number) => `Passo ${n} de ${total}`,
    langues: {
      titre: "Em que língua preferes a app?",
      texte:
        "A conversa com a Camille é sempre em francês. Aqui escolhes os menus e a língua do feedback.",
      interface: "Língua da interface",
      appui: "Língua de apoio (feedback)",
      memeLangue: "Igual à interface",
      changer: "Podes mudar a qualquer momento nas definições.",
    },
    niveau: {
      titre: "Que nível queres atingir?",
      texte: "A Camille ajusta as perguntas e o ritmo ao teu objetivo.",
      usages: {
        A2: "Cartão de residência plurianual",
        B1: "Cartão de residente",
        B2: "Nacionalidade francesa",
      },
      exemples: {
        A2: "Falar de ti e do teu dia a dia com frases simples.",
        B1: "Contar uma experiência e pedir informações com à-vontade.",
        B2: "Defender uma opinião com argumentos e exemplos.",
      },
      conseil: "Não tens a certeza? Começa pelo A2. Podes mudar nas definições.",
    },
    micro: {
      titre: "A Camille precisa de te ouvir",
      texte: "A prova oral pratica-se em voz alta. Para isso, a app pede acesso ao microfone.",
      points: [
        "Só ouvimos enquanto uma sessão está aberta.",
        "Podes parar a qualquer momento com «Terminar».",
        "Com auriculares, a Camille ouve-te melhor.",
      ],
      permettre: "Permitir microfone",
      plusTard: "Agora não",
      refuse:
        "Sem microfone, respondes por escrito. Podes ativá-lo mais tarde nas definições do telemóvel.",
    },
    continuer: "Continuar",
  },
  erreurs: {
    reseau:
      "Sem ligação à API. Confirma que a API está a correr e que o telemóvel está na mesma rede.",
    delai: "A Camille demorou demasiado a responder. Tenta outra vez.",
    reponse_invalide:
      "A API respondeu de forma inesperada. Confirma que a app e a API estão atualizadas.",
    requete_invalide: "O pedido não é válido. Tenta outra vez.",
    session_introuvable: "Esta sessão expirou. Começa uma nova.",
    session_occupee: "A Camille ainda está a responder. Espera um momento.",
    session_terminee: "A sessão já terminou. Vê o feedback.",
    sans_reponse: "Ainda não respondeste à Camille.",
    audio_trop_long: "A gravação é demasiado longa. Tenta uma resposta mais curta.",
    audio_format: "Este formato de áudio não é suportado.",
    audio_vide: "Não se percebeu nada na gravação. Tenta outra vez.",
    service_indisponible: "A Camille não está disponível de momento. Tenta daqui a pouco.",
    inconnu: "Algo correu mal. Tenta outra vez.",
    trop_court_maintenir: "Gravação muito curta. Mantém o microfone premido enquanto falas.",
    trop_court: "Gravação muito curta. Tenta outra vez.",
    non_autorise: "A app não tem acesso à API: a chave de acesso está em falta ou errada.",
    trop_de_requetes: "Demasiados pedidos em pouco tempo. Espera uns minutos.",
  },
};

export type Textes = typeof ptPT;
