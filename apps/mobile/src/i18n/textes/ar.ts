import type { Textes } from "./pt-PT";

/** Plural árabe: 1, 2 (dual), 3–10 (plural) e 11 ou mais (singular). */
function pluriel(n: number, formes: [un: string, deux: string, pluriel: string, onze: string]) {
  if (n === 1) return formes[0];
  if (n === 2) return formes[1];
  if (n >= 3 && n <= 10) return `${n} ${formes[2]}`;
  return `${n} ${formes[3]}`;
}

const minutes = (n: number) => pluriel(n, ["دقيقة واحدة", "دقيقتان", "دقائق", "دقيقة"]);
const echanges = (n: number) => pluriel(n, ["تبادل واحد", "تبادلان", "تبادلات", "تبادلًا"]);
const sessions = (n: number) => pluriel(n, ["جلسة واحدة", "جلستين", "جلسات", "جلسة"]);

export const ar: Textes = {
  marqueSous: "شفهي TCF IRN",
  communs: {
    retour: "رجوع",
    annuler: "إلغاء",
    tu: "أنت",
  },
  onglets: {
    accueil: "الرئيسية",
    historique: "السجل",
    definitions: "الإعدادات",
  },
  taches: {
    entretien: {
      description: "قدّم نفسك: من أنت، حياتك، خططك.",
      resume: "التحدث عن نفسك",
    },
    interaction: {
      description: "اطلب معلومات أو تعامل مع موقف من الحياة اليومية.",
      resume: "التعامل مع موقف",
    },
    point_de_vue: {
      description: "عبّر عن رأيك ودافع عنه بأمثلة.",
      resume: "إبداء رأي والدفاع عنه",
    },
  },
  niveaux: {
    A2: "أساسي",
    B1: "متوسط",
    B2: "فوق المتوسط",
  },
  quand: (jours: number) =>
    jours <= 0
      ? "اليوم"
      : jours === 1
        ? "أمس"
        : jours === 2
          ? "قبل يومين"
          : jours <= 10
            ? `قبل ${jours} أيام`
            : `قبل ${jours} يومًا`,
  duree: (n: number) => (n < 60 ? minutes(n) : `${Math.floor(n / 60)} س ${n % 60} د`),
  accueil: {
    bonjour: "مرحبًا",
    bonjourRetour: "أهلًا بعودتك",
    titre: "هل نتدرّب؟",
    objectif: (niveau: string) => `الهدف ${niveau}`,
    objectifAide: "غيّر المستوى المستهدف في الإعدادات",
    continuer: "واصل التدرّب",
    derniereFois: (niveau: string, quand: string) => `آخر مرة ${niveau}، ${quand}`,
    reprendre: "استئناف",
    choisir: "اختر مهمة",
    commencerAide: "يبدأ جلسة مع كامي",
    dernierNiveau: (niveau: string) => `آخر مستوى مقدَّر: ${niveau}`,
    francais: "المحادثة مع كامي دائمًا بالفرنسية.",
  },
  session: {
    terminer: "إنهاء",
    texte: "النص",
    afficherTranscription: "إظهار نص المحادثة",
    masquerTranscription: "إخفاء نص المحادثة",
    echange: (n: number, total: number) => `التبادل ${n} من ${total}`,
    progression: "تقدّم الجلسة",
    statuts: {
      demarrage: "كامي تستعد…",
      reponse: "كامي تفكّر…",
      evaluation: "كامي تُعدّ ملاحظاتك…",
      ecoute: "أستمع إليك…",
      parle: "كامي تتحدث",
      terminee: "انتهت الجلسة",
      aToi: "دورك الآن",
      sansSession: "لا توجد جلسة",
    },
    reecouter: "استمع مرة أخرى",
    aide: "لا تصحيحات أثناء التمرين. تصلك الملاحظات في النهاية.",
    reessayer: "حاول مرة أخرى",
    voirFeedback: "عرض الملاحظات",
    modes: {
      maintenir: "اضغط للتحدث",
      mainsLibres: "بدون يدين",
    },
    micro: {
      attente: "لحظة…",
      relacher: "اترك الزر للإرسال",
      toucherEnvoyer: "انقر للإرسال (أو توقّف قليلًا)",
      maintenir: "اضغط مطوّلًا للتحدث",
      toucher: "انقر للتحدث",
    },
    ecrire: "اكتب الإجابة",
    repondreVoix: "أجب بصوتك",
    champ: "إجابتك بالفرنسية",
    placeholder: "اكتب إجابتك بالفرنسية…",
    envoyer: "إرسال",
    microRefuse: {
      titre: "كامي لا تستطيع سماعك",
      texte: "تم رفض الوصول إلى الميكروفون. يمكنك الإجابة كتابةً أو تفعيل الميكروفون من الإعدادات.",
      ouvrir: "فتح الإعدادات",
    },
  },
  orbe: {
    parle: "كامي تتحدث",
    ecoute: "كامي تستمع إليك",
    pense: "كامي تفكّر",
    attend: "كامي",
  },
  feedback: {
    titre: "ملاحظات الجلسة",
    niveauEstime: "المستوى المقدَّر",
    echelle: (estime: string, cible: string) =>
      `السلّم من A1 إلى B2: ${estime} المقدَّر، ${cible} الهدف`,
    objectif: "الهدف",
    note: "تقدير مبني على هذه الجلسة. ليس نتيجة رسمية لاختبار TCF.",
    corrections: "أهم التصحيحات",
    sansErreur: "لا أخطاء مهمة في هذه الجلسة",
    ceQueTuAsDit: "ما قلته",
    formeCorrecte: "الصيغة الصحيحة",
    prochaine: "للجلسة القادمة",
    repeter: "كرّر هذه المهمة",
    nouvelle: "مهمة جديدة",
    introuvable: "لم تعد هذه الجلسة في السجل.",
  },
  historique: {
    titre: "السجل",
    sousTitre: "تقدّمك في الاختبار الشفهي",
    sessions: "الجلسات",
    temps: "وقت التدرّب",
    objectif: "الهدف",
    evolution: "تطوّر المستوى المقدَّر",
    dernieres: (n: number, niveau: string) =>
      n === 1 ? `جلستك الأولى · المستوى ${niveau}` : `آخر ${sessions(n)} · آخر مستوى ${niveau}`,
    graphique: (niveaux: string) => `المستويات المقدَّرة من الأقدم إلى الأحدث: ${niveaux}`,
    toutes: "الكل",
    ligne: (n: number, e: number) => `${minutes(n)} · ${echanges(e)}`,
    aucunePourTache: "لم تقم بهذه المهمة بعد.",
    vide: {
      titre: "لا توجد جلسات بعد",
      texte:
        "ابدأ محادثتك الأولى مع كامي. تستغرق نحو 6 دقائق، وفي النهاية سترى هنا مستواك المقدَّر وتطوّرك.",
      graphique: "سيظهر هنا الرسم البياني لتطوّرك.",
      commencer: "ابدأ الجلسة الأولى",
    },
  },
  definitions: {
    titre: "الإعدادات",
    langues: "اللغات",
    interface: "لغة التطبيق",
    appui: "لغة الدعم (الملاحظات)",
    appuiAide: "المحادثة مع كامي دائمًا بالفرنسية. تصلك الملاحظات والشروح بلغة الدعم.",
    pratique: "التدرّب",
    niveau: "المستوى المستهدف",
    vitesse: "سرعة صوت كامي",
    vitesses: {
      lente: "بطيئة",
      normale: "عادية",
      naturelle: "طبيعية",
    },
    ecouterExemple: "استمع إلى مثال",
    micro: "وضع الميكروفون",
    microAide: {
      maintenir: "اضغط على الزر مطوّلًا أثناء حديثك. مناسب للأماكن الصاخبة.",
      mainsLibres: "يفتح الميكروفون تلقائيًا عندما تنتهي كامي من الكلام. مناسب مع السماعات.",
    },
    apparence: "المظهر",
    theme: "السمة",
    themes: {
      clair: "فاتح",
      sombre: "داكن",
      systeme: "النظام",
    },
    donnees: "الخصوصية والبيانات",
    donneesTexte:
      "تبقى التفضيلات والسجل على هذا الجهاز فقط. تُرسَل التسجيلات لتحويلها إلى نص ولا يُحتفَظ بها.",
    effacer: "حذف السجل",
    effacerQuestion: (n: number) => `حذف ${sessions(n)} من السجل؟`,
    effacerConfirmer: "حذف",
    efface: "تم حذف السجل.",
    apropos: "حول اختبار TCF IRN",
    aproposTexte:
      "اختبار TCF IRN هو اختبار اللغة الفرنسية المطلوب في فرنسا للإقامة والجنسية. يتكوّن الاختبار الشفهي من ثلاث مهام: entretien وinteraction وpoint de vue. عادةً تتطلب بطاقة الإقامة متعددة السنوات المستوى A2، وبطاقة المقيم B1، والجنسية B2؛ تحقّق من الشروط الحالية على service-public.fr. تقديرات كامي لا تغني عن الاختبار الرسمي.",
    serveur: (adresse: string) => `الخادم: ${adresse}`,
  },
  erreurs: {
    reseau: "لا يوجد اتصال بالـ API. تأكّد من أن الـ API تعمل وأن الهاتف على الشبكة نفسها.",
    delai: "استغرقت كامي وقتًا طويلًا للرد. حاول مرة أخرى.",
    reponse_invalide: "ردّت الـ API بشكل غير متوقع. تأكّد من أن التطبيق والـ API محدَّثان.",
    requete_invalide: "الطلب غير صالح. حاول مرة أخرى.",
    session_introuvable: "انتهت صلاحية هذه الجلسة. ابدأ جلسة جديدة.",
    session_occupee: "كامي ما زالت ترد. انتظر لحظة.",
    session_terminee: "انتهت الجلسة. اطّلع على الملاحظات.",
    sans_reponse: "لم تردّ على كامي بعد.",
    audio_trop_long: "التسجيل طويل جدًا. جرّب إجابة أقصر.",
    audio_format: "صيغة الصوت هذه غير مدعومة.",
    audio_vide: "لم نفهم شيئًا من التسجيل. حاول مرة أخرى.",
    service_indisponible: "كامي غير متاحة حاليًا. حاول بعد قليل.",
    inconnu: "حدث خطأ ما. حاول مرة أخرى.",
    trop_court_maintenir: "التسجيل قصير جدًا. واصل الضغط على الميكروفون أثناء حديثك.",
    trop_court: "التسجيل قصير جدًا. حاول مرة أخرى.",
    non_autorise: "التطبيق لا يملك صلاحية الوصول إلى الـ API: مفتاح الوصول مفقود أو خاطئ.",
    trop_de_requetes: "طلبات كثيرة جدًا في وقت قصير. انتظر بضع دقائق.",
  },
};
