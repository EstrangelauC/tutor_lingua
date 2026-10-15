import type { Textes } from "./pt-PT";

export const en: Textes = {
  marqueSous: "TCF IRN speaking",
  communs: {
    retour: "Back",
    annuler: "Cancel",
    tu: "You",
  },
  onglets: {
    accueil: "Home",
    historique: "History",
    definitions: "Settings",
  },
  taches: {
    entretien: {
      description: "Introduce yourself: who you are, your life, your plans.",
      resume: "Talk about yourself",
    },
    interaction: {
      description: "Ask for information or sort out an everyday situation.",
      resume: "Sort out a situation",
    },
    point_de_vue: {
      description: "Give your opinion and back it up with examples.",
      resume: "Give and defend an opinion",
    },
  },
  niveaux: {
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper intermediate",
  },
  quand: (jours: number) =>
    jours <= 0 ? "today" : jours === 1 ? "yesterday" : `${jours} days ago`,
  duree: (minutes: number) =>
    minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`,
  accueil: {
    bonjour: "Hello",
    bonjourRetour: "Welcome back",
    titre: "Ready to practise?",
    objectif: (niveau: string) => `Goal ${niveau}`,
    objectifAide: "Change your target level in Settings",
    continuer: "Keep practising",
    derniereFois: (niveau: string, quand: string) => `last time ${niveau}, ${quand}`,
    reprendre: "Resume",
    choisir: "Choose a task",
    commencerAide: "Starts a session with Camille",
    dernierNiveau: (niveau: string) => `Last estimated level: ${niveau}`,
    francais: "The conversation with Camille is always in French.",
  },
  session: {
    terminer: "Finish",
    texte: "Text",
    transcription: "Transcript",
    afficherTranscription: "Show transcript",
    masquerTranscription: "Hide transcript",
    echange: (n: number, total: number) => `Turn ${n} of ${total}`,
    progression: "Session progress",
    statuts: {
      demarrage: "Camille is getting ready…",
      reveil: (n: number, total: number) => `Waking Camille up… (attempt ${n} of ${total})`,
      reponse: "Camille is thinking…",
      evaluation: "Camille is preparing your feedback…",
      ecoute: "Listening…",
      parle: "Camille is speaking",
      terminee: "Session finished",
      aToi: "Your turn",
      sansSession: "No session",
    },
    reecouter: "Listen again",
    aide: "No corrections during the exercise. Feedback comes at the end.",
    reessayer: "Try again",
    voirFeedback: "See feedback",
    modes: {
      maintenir: "Hold to talk",
      mainsLibres: "Hands-free",
    },
    micro: {
      attente: "One moment…",
      relacher: "Release to send",
      toucherEnvoyer: "Tap to send (or pause)",
      maintenir: "Press and hold to talk",
      toucher: "Tap to talk",
      espace: "or the Space bar",
    },
    ecrire: "Type your answer",
    repondreVoix: "Answer by voice",
    champ: "Your answer in French",
    placeholder: "Type your answer in French…",
    envoyer: "Send",
    microRefuse: {
      titre: "Camille can't hear you",
      texte:
        "Microphone access was denied. You can answer in writing or turn on the microphone in settings.",
      ouvrir: "Open settings",
    },
  },
  orbe: {
    parle: "Camille is speaking",
    ecoute: "Camille is listening to you",
    pense: "Camille is thinking",
    attend: "Camille",
  },
  feedback: {
    titre: "Session feedback",
    niveauEstime: "Estimated level",
    echelle: (estime: string, cible: string) =>
      `Scale from A1 to B2: ${estime} estimated, ${cible} goal`,
    objectif: "goal",
    note: "An estimate based on this session. Not an official TCF score.",
    corrections: "The most important corrections",
    sansErreur: "No major mistakes in this session",
    ceQueTuAsDit: "What you said",
    formeCorrecte: "Correct form",
    ecouter: "Listen",
    prochaine: "For your next session",
    repeter: "Repeat this task",
    nouvelle: "New task",
    introuvable: "This session is no longer in your history.",
  },
  historique: {
    titre: "History",
    sousTitre: "Your progress in the speaking test",
    sessions: "Sessions",
    temps: "Practice time",
    objectif: "Goal",
    evolution: "Estimated level over time",
    dernieres: (n: number, niveau: string) =>
      n === 1
        ? `Your first session · level ${niveau}`
        : `Last ${n} sessions · latest level ${niveau}`,
    graphique: (niveaux: string) => `Estimated levels, from oldest to newest session: ${niveaux}`,
    toutes: "All",
    ligne: (minutes: number, echanges: number) =>
      `${minutes} min · ${echanges} ${echanges === 1 ? "turn" : "turns"}`,
    aucunePourTache: "You haven't done this task yet.",
    vide: {
      titre: "No sessions yet",
      texte:
        "Have your first conversation with Camille. It takes about 6 minutes, and afterwards you'll see your estimated level and your progress here.",
      graphique: "Your progress chart will appear here.",
      commencer: "Start your first session",
    },
  },
  definitions: {
    titre: "Settings",
    langues: "Languages",
    interface: "App language",
    appui: "Support language (feedback)",
    appuiAide:
      "The conversation with Camille is always in French. Feedback and explanations come in your support language.",
    pratique: "Practice",
    niveau: "Target level",
    vitesse: "Camille's speaking speed",
    vitesses: {
      lente: "Slow",
      normale: "Normal",
      naturelle: "Natural",
    },
    ecouterExemple: "Play sample",
    micro: "Microphone mode",
    retours: "Vibration and sound cue",
    retoursAide:
      "A vibration when recording starts and stops; in hands-free mode, a cue when the microphone opens.",
    microAide: {
      maintenir: "Hold the button while you speak. Best in noisy places.",
      mainsLibres: "The microphone opens by itself when Camille finishes. Best with earphones.",
    },
    apparence: "Appearance",
    theme: "Theme",
    themes: {
      clair: "Light",
      sombre: "Dark",
      systeme: "System",
    },
    donnees: "Privacy and data",
    donneesTexte:
      "Your preferences and history stay on this device. Recordings are sent for transcription and are not kept.",
    effacer: "Delete history",
    effacerQuestion: (n: number) =>
      n === 1 ? "Delete 1 session from your history?" : `Delete ${n} sessions from your history?`,
    effacerConfirmer: "Delete",
    efface: "History deleted.",
    apropos: "About the TCF IRN test",
    aproposTexte:
      "The TCF IRN is the French test required in France for residence and citizenship. The speaking test has three tasks: entretien, interaction and point de vue. As a rule, the multi-year residence card requires A2, the resident card B1 and citizenship B2; check the current requirements on service-public.fr. Camille's estimates do not replace the official test.",
    serveur: (adresse: string) => `Server: ${adresse}`,
  },
  onboarding: {
    etape: (n: number, total: number) => `Step ${n} of ${total}`,
    langues: {
      titre: "Which language do you want the app in?",
      texte:
        "The conversation with Camille is always in French. Here you choose the menus and the feedback language.",
      interface: "App language",
      appui: "Support language (feedback)",
      memeLangue: "Same as the app",
      changer: "You can change this at any time in Settings.",
    },
    niveau: {
      titre: "Which level are you aiming for?",
      texte: "Camille adapts her questions and pace to your goal.",
      usages: { A2: "Multi-year residence card", B1: "Resident card", B2: "French citizenship" },
      exemples: {
        A2: "Talk about yourself and your daily life in simple sentences.",
        B1: "Tell about an experience and ask for information with ease.",
        B2: "Defend an opinion with arguments and examples.",
      },
      conseil: "Not sure? Start with A2. You can change it in Settings.",
    },
    micro: {
      titre: "Camille needs to hear you",
      texte: "The speaking test is practised out loud, so the app asks for microphone access.",
      points: [
        "We only listen while a session is open.",
        "You can stop at any time with “Finish”.",
        "With earphones, Camille hears you better.",
      ],
      permettre: "Allow microphone",
      plusTard: "Not now",
      refuse:
        "Without a microphone you answer in writing. You can turn it on later in your phone's settings.",
    },
    continuer: "Continue",
  },
  erreurs: {
    reseau:
      "Can't reach the API. Make sure it's running and that your phone is on the same network.",
    delai: "Camille took too long to answer. Try again.",
    reponse_invalide:
      "The API sent an unexpected response. Make sure the app and the API are up to date.",
    requete_invalide: "The request isn't valid. Try again.",
    session_introuvable: "This session has expired. Start a new one.",
    session_occupee: "Camille is still answering. Wait a moment.",
    session_terminee: "The session is over. See your feedback.",
    sans_reponse: "You haven't answered Camille yet.",
    audio_trop_long: "The recording is too long. Try a shorter answer.",
    audio_format: "This audio format isn't supported.",
    audio_vide: "Nothing could be heard in the recording. Try again.",
    service_indisponible: "Camille isn't available right now. Try again shortly.",
    inconnu: "Something went wrong. Try again.",
    trop_court_maintenir: "Recording too short. Keep the microphone pressed while you speak.",
    trop_court: "Recording too short. Try again.",
    non_autorise: "The app has no access to the API: the access key is missing or wrong.",
    trop_de_requetes: "Too many requests in a short time. Wait a few minutes.",
  },
};
