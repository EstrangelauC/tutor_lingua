import type { Textes } from "./pt-PT";

/** Plural romeno: 1 → singular; até 19 → plural; a partir de 20 → «de» + plural (21 de minute). */
function pluriel(n: number, [un, plusieurs]: [string, string]) {
  if (n === 1) return `1 ${un}`;
  const c = n % 100;
  return c >= 1 && c <= 19 ? `${n} ${plusieurs}` : `${n} de ${plusieurs}`;
}

const repliques = (n: number) => pluriel(n, ["replică", "replici"]);
const sessions = (n: number) => pluriel(n, ["sesiune", "sesiuni"]);

export const ro: Textes = {
  marqueSous: "Oral TCF IRN",
  communs: {
    retour: "Înapoi",
    annuler: "Anulează",
    tu: "Tu",
  },
  onglets: {
    accueil: "Acasă",
    historique: "Istoric",
    definitions: "Setări",
  },
  taches: {
    entretien: {
      description: "Prezintă-te: cine ești, viața ta, planurile tale.",
      resume: "Să vorbești despre tine",
    },
    interaction: {
      description: "Cere informații sau rezolvă o situație de zi cu zi.",
      resume: "Să rezolvi o situație",
    },
    point_de_vue: {
      description: "Spune-ți părerea și susține-o cu exemple.",
      resume: "Să-ți spui și să-ți susții părerea",
    },
  },
  niveaux: {
    A2: "Elementar",
    B1: "Intermediar",
    B2: "Intermediar superior",
  },
  quand: (jours: number) =>
    jours <= 0 ? "azi" : jours === 1 ? "ieri" : `acum ${pluriel(jours, ["zi", "zile"])}`,
  duree: (minutes: number) =>
    minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`,
  accueil: {
    bonjour: "Bună",
    bonjourRetour: "Bine ai revenit",
    titre: "Exersăm?",
    objectif: (niveau: string) => `Obiectiv ${niveau}`,
    objectifAide: "Schimbă nivelul țintă din setări",
    continuer: "Continuă să exersezi",
    derniereFois: (niveau: string, quand: string) => `ultima dată ${niveau}, ${quand}`,
    reprendre: "Reia",
    choisir: "Alege o sarcină",
    commencerAide: "Începe o sesiune cu Camille",
    dernierNiveau: (niveau: string) => `Ultimul nivel estimat: ${niveau}`,
    francais: "Conversația cu Camille este mereu în franceză.",
  },
  session: {
    terminer: "Termină",
    texte: "Text",
    transcription: "Transcriere",
    afficherTranscription: "Arată transcrierea",
    masquerTranscription: "Ascunde transcrierea",
    echange: (n: number, total: number) => `Replica ${n} din ${total}`,
    progression: "Progresul sesiunii",
    statuts: {
      demarrage: "Camille se pregătește…",
      reponse: "Camille se gândește…",
      evaluation: "Camille îți pregătește feedbackul…",
      ecoute: "Te ascult…",
      parle: "Camille vorbește",
      terminee: "Sesiune încheiată",
      aToi: "E rândul tău",
      sansSession: "Fără sesiune",
    },
    reecouter: "Ascultă din nou",
    aide: "Fără corecturi în timpul exercițiului. Feedbackul vine la sfârșit.",
    reessayer: "Încearcă din nou",
    voirFeedback: "Vezi feedbackul",
    modes: {
      maintenir: "Apasă pentru a vorbi",
      mainsLibres: "Mâini libere",
    },
    micro: {
      attente: "O clipă…",
      relacher: "Eliberează pentru a trimite",
      toucherEnvoyer: "Atinge pentru a trimite (sau fă o pauză)",
      maintenir: "Ține apăsat pentru a vorbi",
      toucher: "Atinge pentru a vorbi",
      espace: "sau tasta Spațiu",
    },
    ecrire: "Scrie răspunsul",
    repondreVoix: "Răspunde cu vocea",
    champ: "Răspunsul tău în franceză",
    placeholder: "Scrie răspunsul tău în franceză…",
    envoyer: "Trimite",
    microRefuse: {
      titre: "Camille nu te poate auzi",
      texte:
        "Accesul la microfon a fost refuzat. Poți răspunde în scris sau poți activa microfonul din setări.",
      ouvrir: "Deschide setările",
    },
  },
  orbe: {
    parle: "Camille vorbește",
    ecoute: "Camille te ascultă",
    pense: "Camille se gândește",
    attend: "Camille",
  },
  feedback: {
    titre: "Feedbackul sesiunii",
    niveauEstime: "Nivel estimat",
    echelle: (estime: string, cible: string) =>
      `Scara de la A1 la B2: ${estime} estimat, ${cible} obiectiv`,
    objectif: "obiectiv",
    note: "Estimare bazată pe această sesiune. Nu este o notă oficială TCF.",
    corrections: "Cele mai importante corecturi",
    sansErreur: "Nicio greșeală importantă în această sesiune",
    ceQueTuAsDit: "Ce ai spus",
    formeCorrecte: "Forma corectă",
    ecouter: "Ascultă",
    prochaine: "Pentru sesiunea următoare",
    repeter: "Repetă această sarcină",
    nouvelle: "Sarcină nouă",
    introuvable: "Această sesiune nu mai este în istoric.",
  },
  historique: {
    titre: "Istoric",
    sousTitre: "Progresul tău la proba orală",
    sessions: "Sesiuni",
    temps: "Timp de exersare",
    objectif: "Obiectiv",
    evolution: "Evoluția nivelului estimat",
    dernieres: (n: number, niveau: string) =>
      n === 1
        ? `Prima ta sesiune · nivel ${niveau}`
        : `Ultimele ${sessions(n)} · ultimul nivel ${niveau}`,
    graphique: (niveaux: string) =>
      `Niveluri estimate, de la cea mai veche sesiune la cea mai recentă: ${niveaux}`,
    toutes: "Toate",
    ligne: (minutes: number, echanges: number) => `${minutes} min · ${repliques(echanges)}`,
    aucunePourTache: "Nu ai făcut încă această sarcină.",
    vide: {
      titre: "Încă nu ai sesiuni",
      texte:
        "Ai prima conversație cu Camille. Durează cam 6 minute, iar la sfârșit vezi aici nivelul tău estimat și evoluția ta.",
      graphique: "Graficul evoluției tale va apărea aici.",
      commencer: "Începe prima sesiune",
    },
  },
  definitions: {
    titre: "Setări",
    langues: "Limbi",
    interface: "Limba aplicației",
    appui: "Limba de sprijin (feedback)",
    appuiAide:
      "Conversația cu Camille este mereu în franceză. Feedbackul și explicațiile vin în limba de sprijin.",
    pratique: "Exersare",
    niveau: "Nivel țintă",
    vitesse: "Viteza vocii lui Camille",
    vitesses: {
      lente: "Lentă",
      normale: "Normală",
      naturelle: "Naturală",
    },
    ecouterExemple: "Ascultă un exemplu",
    micro: "Modul microfonului",
    microAide: {
      maintenir: "Ține butonul apăsat cât timp vorbești. Ideal în locuri zgomotoase.",
      mainsLibres: "Microfonul se deschide singur când Camille termină. Ideal cu căști.",
    },
    apparence: "Aspect",
    theme: "Temă",
    themes: {
      clair: "Luminoasă",
      sombre: "Întunecată",
      systeme: "Sistem",
    },
    donnees: "Confidențialitate și date",
    donneesTexte:
      "Preferințele și istoricul rămân doar pe acest dispozitiv. Înregistrările sunt trimise pentru transcriere și nu sunt păstrate.",
    effacer: "Șterge istoricul",
    effacerQuestion: (n: number) => `Ștergi ${sessions(n)} din istoric?`,
    effacerConfirmer: "Șterge",
    efface: "Istoricul a fost șters.",
    apropos: "Despre examenul TCF IRN",
    aproposTexte:
      "TCF IRN este testul de franceză cerut în Franța pentru rezidență și cetățenie. Proba orală are trei sarcini: entretien, interaction și point de vue. De regulă, cardul de rezidență multianual cere A2, cardul de rezident B1 și cetățenia B2; verifică cerințele actuale pe service-public.fr. Estimările lui Camille nu înlocuiesc examenul oficial.",
    serveur: (adresse: string) => `Server: ${adresse}`,
  },
  onboarding: {
    etape: (n: number, total: number) => `Pasul ${n} din ${total}`,
    langues: {
      titre: "În ce limbă vrei aplicația?",
      texte:
        "Conversația cu Camille este mereu în franceză. Aici alegi limba meniurilor și a feedbackului.",
      interface: "Limba aplicației",
      appui: "Limba de sprijin (feedback)",
      memeLangue: "Aceeași ca aplicația",
      changer: "Poți schimba oricând din setări.",
    },
    niveau: {
      titre: "Ce nivel vrei să atingi?",
      texte: "Camille își adaptează întrebările și ritmul la obiectivul tău.",
      usages: {
        A2: "Card de rezidență multianual",
        B1: "Card de rezident",
        B2: "Cetățenia franceză",
      },
      exemples: {
        A2: "Să vorbești despre tine și viața de zi cu zi în propoziții simple.",
        B1: "Să povestești o experiență și să ceri informații cu ușurință.",
        B2: "Să aperi o opinie cu argumente și exemple.",
      },
      conseil: "Nu ești sigur? Începe cu A2. Poți schimba din setări.",
    },
    micro: {
      titre: "Camille trebuie să te audă",
      texte: "Proba orală se exersează cu voce tare, așa că aplicația cere acces la microfon.",
      points: [
        "Ascultăm doar cât timp o sesiune este deschisă.",
        "Te poți opri oricând cu „Termină”.",
        "Cu căști, Camille te aude mai bine.",
      ],
      permettre: "Permite microfonul",
      plusTard: "Nu acum",
      refuse:
        "Fără microfon răspunzi în scris. Îl poți activa mai târziu din setările telefonului.",
    },
    continuer: "Continuă",
  },
  erreurs: {
    reseau:
      "Nu există conexiune cu API-ul. Verifică dacă API-ul rulează și dacă telefonul este în aceeași rețea.",
    delai: "Camille a întârziat prea mult cu răspunsul. Încearcă din nou.",
    reponse_invalide:
      "API-ul a răspuns neașteptat. Verifică dacă aplicația și API-ul sunt actualizate.",
    requete_invalide: "Cererea nu este validă. Încearcă din nou.",
    session_introuvable: "Această sesiune a expirat. Începe una nouă.",
    session_occupee: "Camille încă răspunde. Așteaptă o clipă.",
    session_terminee: "Sesiunea s-a încheiat. Vezi feedbackul.",
    sans_reponse: "Nu i-ai răspuns încă lui Camille.",
    audio_trop_long: "Înregistrarea este prea lungă. Încearcă un răspuns mai scurt.",
    audio_format: "Acest format audio nu este acceptat.",
    audio_vide: "Nu s-a înțeles nimic din înregistrare. Încearcă din nou.",
    service_indisponible: "Camille nu este disponibilă momentan. Încearcă puțin mai târziu.",
    inconnu: "Ceva n-a mers bine. Încearcă din nou.",
    trop_court_maintenir: "Înregistrare prea scurtă. Ține microfonul apăsat cât timp vorbești.",
    trop_court: "Înregistrare prea scurtă. Încearcă din nou.",
    non_autorise: "Aplicația nu are acces la API: cheia de acces lipsește sau este greșită.",
    trop_de_requetes: "Prea multe cereri într-un timp scurt. Așteaptă câteva minute.",
  },
};
