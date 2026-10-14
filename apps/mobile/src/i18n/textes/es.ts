import type { Textes } from "./pt-PT";

export const es: Textes = {
  marqueSous: "Oral TCF IRN",
  communs: {
    retour: "Volver",
    annuler: "Cancelar",
    tu: "Tú",
  },
  onglets: {
    accueil: "Inicio",
    historique: "Historial",
    definitions: "Ajustes",
  },
  taches: {
    entretien: {
      description: "Presentarte: quién eres, tu vida, tus planes.",
      resume: "Hablar de ti",
    },
    interaction: {
      description: "Pedir información o resolver una situación cotidiana.",
      resume: "Resolver una situación",
    },
    point_de_vue: {
      description: "Dar tu opinión y defenderla con ejemplos.",
      resume: "Dar y defender una opinión",
    },
  },
  niveaux: {
    A2: "Elemental",
    B1: "Intermedio",
    B2: "Intermedio alto",
  },
  quand: (jours: number) => (jours <= 0 ? "hoy" : jours === 1 ? "ayer" : `hace ${jours} días`),
  duree: (minutes: number) =>
    minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`,
  accueil: {
    bonjour: "Hola",
    bonjourRetour: "Hola de nuevo",
    titre: "¿Practicamos?",
    objectif: (niveau: string) => `Objetivo ${niveau}`,
    objectifAide: "Cambiar el nivel objetivo en los ajustes",
    continuer: "Seguir practicando",
    derniereFois: (niveau: string, quand: string) => `última vez ${niveau}, ${quand}`,
    reprendre: "Retomar",
    choisir: "Elige una tarea",
    commencerAide: "Empieza una sesión con Camille",
    dernierNiveau: (niveau: string) => `Último nivel estimado: ${niveau}`,
    francais: "La conversación con Camille es siempre en francés.",
  },
  session: {
    terminer: "Terminar",
    texte: "Texto",
    afficherTranscription: "Mostrar transcripción",
    masquerTranscription: "Ocultar transcripción",
    echange: (n: number, total: number) => `Turno ${n} de ${total}`,
    progression: "Progreso de la sesión",
    statuts: {
      demarrage: "Camille se está preparando…",
      reponse: "Camille está pensando…",
      evaluation: "Camille está preparando tu feedback…",
      ecoute: "Te escucho…",
      parle: "Camille está hablando",
      terminee: "Sesión terminada",
      aToi: "Te toca",
      sansSession: "Sin sesión",
    },
    reecouter: "Escuchar otra vez",
    aide: "Sin correcciones durante el ejercicio. El feedback llega al final.",
    reessayer: "Intentar otra vez",
    voirFeedback: "Ver el feedback",
    modes: {
      maintenir: "Mantener para hablar",
      mainsLibres: "Manos libres",
    },
    micro: {
      attente: "Un momento…",
      relacher: "Suelta para enviar",
      toucherEnvoyer: "Toca para enviar (o haz una pausa)",
      maintenir: "Mantén pulsado para hablar",
      toucher: "Toca para hablar",
    },
    ecrire: "Escribir la respuesta",
    repondreVoix: "Responder con la voz",
    champ: "Tu respuesta en francés",
    placeholder: "Escribe tu respuesta en francés…",
    envoyer: "Enviar",
    microRefuse: {
      titre: "Camille no te puede oír",
      texte:
        "Se denegó el acceso al micrófono. Puedes responder por escrito o activar el micrófono en los ajustes.",
      ouvrir: "Abrir ajustes",
    },
  },
  orbe: {
    parle: "Camille está hablando",
    ecoute: "Camille te está escuchando",
    pense: "Camille está pensando",
    attend: "Camille",
  },
  feedback: {
    titre: "Feedback de la sesión",
    niveauEstime: "Nivel estimado",
    echelle: (estime: string, cible: string) =>
      `Escala de A1 a B2: ${estime} estimado, ${cible} objetivo`,
    objectif: "objetivo",
    note: "Estimación basada en esta sesión. No es una nota oficial del TCF.",
    corrections: "Las correcciones más importantes",
    sansErreur: "Sin errores importantes en esta sesión",
    ceQueTuAsDit: "Lo que dijiste",
    formeCorrecte: "Forma correcta",
    prochaine: "Para la próxima sesión",
    repeter: "Repetir esta tarea",
    nouvelle: "Nueva tarea",
    introuvable: "Esta sesión ya no está en el historial.",
  },
  historique: {
    titre: "Historial",
    sousTitre: "Tu progreso en la prueba oral",
    sessions: "Sesiones",
    temps: "Tiempo de práctica",
    objectif: "Objetivo",
    evolution: "Evolución del nivel estimado",
    dernieres: (n: number, niveau: string) =>
      n === 1
        ? `Tu primera sesión · nivel ${niveau}`
        : `Últimas ${n} sesiones · último nivel ${niveau}`,
    graphique: (niveaux: string) =>
      `Niveles estimados, de la sesión más antigua a la más reciente: ${niveaux}`,
    toutes: "Todas",
    ligne: (minutes: number, echanges: number) =>
      `${minutes} min · ${echanges} ${echanges === 1 ? "turno" : "turnos"}`,
    aucunePourTache: "Todavía no has hecho esta tarea.",
    vide: {
      titre: "Todavía no tienes sesiones",
      texte:
        "Ten tu primera conversación con Camille. Son unos 6 minutos y, al final, verás aquí tu nivel estimado y tu evolución.",
      graphique: "Tu gráfico de evolución aparecerá aquí.",
      commencer: "Empezar la primera sesión",
    },
  },
  definitions: {
    titre: "Ajustes",
    langues: "Idiomas",
    interface: "Interfaz",
    appui: "Apoyo (feedback)",
    appuiAide:
      "La conversación con Camille es siempre en francés. El feedback y las explicaciones llegan en el idioma de apoyo.",
    pratique: "Práctica",
    niveau: "Nivel objetivo",
    vitesse: "Velocidad de la voz de Camille",
    vitesses: {
      lente: "Lenta",
      normale: "Normal",
      naturelle: "Natural",
    },
    ecouterExemple: "Escuchar ejemplo",
    micro: "Modo del micrófono",
    microAide: {
      maintenir: "Mantén el botón pulsado mientras hablas. Ideal en sitios con ruido.",
      mainsLibres: "El micrófono se abre solo cuando Camille termina. Ideal con auriculares.",
    },
    apparence: "Apariencia",
    theme: "Tema",
    themes: {
      clair: "Claro",
      sombre: "Oscuro",
      systeme: "Sistema",
    },
    donnees: "Privacidad y datos",
    donneesTexte:
      "Las preferencias y el historial se quedan solo en este dispositivo. Las grabaciones se envían para transcribirlas y no se guardan.",
    effacer: "Borrar historial",
    effacerQuestion: (n: number) =>
      n === 1 ? "¿Borrar 1 sesión del historial?" : `¿Borrar ${n} sesiones del historial?`,
    effacerConfirmer: "Borrar",
    efface: "Historial borrado.",
    apropos: "Sobre la prueba TCF IRN",
    aproposTexte:
      "El TCF IRN es el examen de francés que se pide en Francia para la residencia y la nacionalidad. La prueba oral tiene tres tareas: entretien, interaction y point de vue. Por lo general, la tarjeta plurianual pide A2, la tarjeta de residente B1 y la nacionalidad B2; consulta los requisitos actuales en service-public.fr. Las estimaciones de Camille no sustituyen a la prueba oficial.",
    serveur: (adresse: string) => `Servidor: ${adresse}`,
  },
  erreurs: {
    reseau:
      "Sin conexión con la API. Comprueba que la API está en marcha y que el móvil está en la misma red.",
    delai: "Camille ha tardado demasiado en responder. Inténtalo otra vez.",
    reponse_invalide:
      "La API ha respondido de forma inesperada. Comprueba que la app y la API están actualizadas.",
    requete_invalide: "La petición no es válida. Inténtalo otra vez.",
    session_introuvable: "Esta sesión ha caducado. Empieza una nueva.",
    session_occupee: "Camille todavía está respondiendo. Espera un momento.",
    session_terminee: "La sesión ya ha terminado. Mira el feedback.",
    sans_reponse: "Todavía no has respondido a Camille.",
    audio_trop_long: "La grabación es demasiado larga. Prueba con una respuesta más corta.",
    audio_format: "Este formato de audio no es compatible.",
    audio_vide: "No se ha entendido nada en la grabación. Inténtalo otra vez.",
    service_indisponible: "Camille no está disponible ahora mismo. Inténtalo dentro de un rato.",
    inconnu: "Algo ha salido mal. Inténtalo otra vez.",
    trop_court_maintenir: "Grabación muy corta. Mantén pulsado el micrófono mientras hablas.",
    trop_court: "Grabación muy corta. Inténtalo otra vez.",
  },
};
