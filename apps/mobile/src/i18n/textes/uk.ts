import type { Textes } from "./pt-PT";

/** Plural ucraniano: 1 (21, 31…), 2–4 (22–24…) e o resto (5–20, 25…). */
function pluriel(n: number, [un, peu, beaucoup]: [string, string, string]) {
  const d = n % 10;
  const c = n % 100;
  const forme = d === 1 && c !== 11 ? un : d >= 2 && d <= 4 && (c < 12 || c > 14) ? peu : beaucoup;
  return `${n} ${forme}`;
}

const repliques = (n: number) => pluriel(n, ["репліка", "репліки", "реплік"]);
const sessions = (n: number) => pluriel(n, ["сесія", "сесії", "сесій"]);
/** Acusativo, depois de «видалити». */
const sessionsAcc = (n: number) => pluriel(n, ["сесію", "сесії", "сесій"]);

export const uk: Textes = {
  marqueSous: "Усний TCF IRN",
  communs: {
    retour: "Назад",
    annuler: "Скасувати",
    tu: "Ви",
  },
  onglets: {
    accueil: "Головна",
    historique: "Історія",
    definitions: "Налаштування",
  },
  taches: {
    entretien: {
      description: "Розкажіть про себе: хто ви, ваше життя, ваші плани.",
      resume: "Розповісти про себе",
    },
    interaction: {
      description: "Запитати інформацію або розв'язати повсякденну ситуацію.",
      resume: "Розв'язати ситуацію",
    },
    point_de_vue: {
      description: "Висловити свою думку й обґрунтувати її прикладами.",
      resume: "Висловити й відстояти думку",
    },
  },
  niveaux: {
    A2: "Базовий",
    B1: "Середній",
    B2: "Вище середнього",
  },
  quand: (jours: number) =>
    jours <= 0
      ? "сьогодні"
      : jours === 1
        ? "вчора"
        : `${pluriel(jours, ["день", "дні", "днів"])} тому`,
  duree: (minutes: number) =>
    minutes < 60 ? `${minutes} хв` : `${Math.floor(minutes / 60)} год ${minutes % 60} хв`,
  accueil: {
    bonjour: "Вітаємо",
    bonjourRetour: "З поверненням",
    titre: "Потренуємось?",
    objectif: (niveau: string) => `Мета ${niveau}`,
    objectifAide: "Змінити цільовий рівень у налаштуваннях",
    continuer: "Продовжити тренування",
    derniereFois: (niveau: string, quand: string) => `минулого разу ${niveau}, ${quand}`,
    reprendre: "Продовжити",
    choisir: "Оберіть завдання",
    commencerAide: "Починає сесію з Камілою",
    dernierNiveau: (niveau: string) => `Останній оцінений рівень: ${niveau}`,
    francais: "Розмова з Камілою завжди французькою.",
  },
  session: {
    terminer: "Завершити",
    texte: "Текст",
    transcription: "Транскрипція",
    afficherTranscription: "Показати транскрипцію",
    masquerTranscription: "Сховати транскрипцію",
    echange: (n: number, total: number) => `Репліка ${n} з ${total}`,
    progression: "Перебіг сесії",
    statuts: {
      demarrage: "Каміла готується…",
      reponse: "Каміла думає…",
      evaluation: "Каміла готує ваш відгук…",
      ecoute: "Слухаю вас…",
      parle: "Каміла говорить",
      terminee: "Сесію завершено",
      aToi: "Ваша черга",
      sansSession: "Немає сесії",
    },
    reecouter: "Прослухати ще раз",
    aide: "Під час вправи виправлень немає. Відгук буде наприкінці.",
    reessayer: "Спробувати ще раз",
    voirFeedback: "Переглянути відгук",
    modes: {
      maintenir: "Утримуйте, щоб говорити",
      mainsLibres: "Без рук",
    },
    micro: {
      attente: "Хвилинку…",
      relacher: "Відпустіть, щоб надіслати",
      toucherEnvoyer: "Торкніться, щоб надіслати (або зробіть паузу)",
      maintenir: "Утримуйте, щоб говорити",
      toucher: "Торкніться, щоб говорити",
      espace: "або клавіша Пробіл",
    },
    ecrire: "Написати відповідь",
    repondreVoix: "Відповісти голосом",
    champ: "Ваша відповідь французькою",
    placeholder: "Напишіть відповідь французькою…",
    envoyer: "Надіслати",
    microRefuse: {
      titre: "Каміла вас не чує",
      texte:
        "Доступ до мікрофона відхилено. Можете відповідати письмово або увімкнути мікрофон у налаштуваннях.",
      ouvrir: "Відкрити налаштування",
    },
  },
  orbe: {
    parle: "Каміла говорить",
    ecoute: "Каміла вас слухає",
    pense: "Каміла думає",
    attend: "Каміла",
  },
  feedback: {
    titre: "Відгук про сесію",
    niveauEstime: "Оцінений рівень",
    echelle: (estime: string, cible: string) =>
      `Шкала від A1 до B2: оцінено ${estime}, мета ${cible}`,
    objectif: "мета",
    note: "Оцінка на основі цієї сесії. Це не офіційний результат TCF.",
    corrections: "Найважливіші виправлення",
    sansErreur: "У цій сесії немає суттєвих помилок",
    ceQueTuAsDit: "Що ви сказали",
    formeCorrecte: "Правильна форма",
    ecouter: "Прослухати",
    prochaine: "До наступної сесії",
    repeter: "Повторити це завдання",
    nouvelle: "Нове завдання",
    introuvable: "Цієї сесії вже немає в історії.",
  },
  historique: {
    titre: "Історія",
    sousTitre: "Ваш прогрес в усному іспиті",
    sessions: "Сесії",
    temps: "Час практики",
    objectif: "Мета",
    evolution: "Динаміка оціненого рівня",
    dernieres: (n: number, niveau: string) =>
      n === 1
        ? `Ваша перша сесія · рівень ${niveau}`
        : `Останні ${sessions(n)} · останній рівень ${niveau}`,
    graphique: (niveaux: string) =>
      `Оцінені рівні, від найдавнішої сесії до найновішої: ${niveaux}`,
    toutes: "Усі",
    ligne: (minutes: number, echanges: number) => `${minutes} хв · ${repliques(echanges)}`,
    aucunePourTache: "Ви ще не виконували це завдання.",
    vide: {
      titre: "Сесій ще немає",
      texte:
        "Проведіть першу розмову з Камілою. Це близько 6 хвилин, а наприкінці ви побачите тут свій оцінений рівень і прогрес.",
      graphique: "Тут з'явиться графік вашого прогресу.",
      commencer: "Почати першу сесію",
    },
  },
  definitions: {
    titre: "Налаштування",
    langues: "Мови",
    interface: "Мова застосунку",
    appui: "Мова підтримки (відгук)",
    appuiAide:
      "Розмова з Камілою завжди французькою. Відгук і пояснення надходять мовою підтримки.",
    pratique: "Практика",
    niveau: "Цільовий рівень",
    vitesse: "Швидкість голосу Каміли",
    vitesses: {
      lente: "Повільна",
      normale: "Звичайна",
      naturelle: "Природна",
    },
    ecouterExemple: "Прослухати приклад",
    micro: "Режим мікрофона",
    microAide: {
      maintenir: "Утримуйте кнопку, поки говорите. Зручно в гамірних місцях.",
      mainsLibres: "Мікрофон вмикається сам, коли Каміла закінчує. Зручно з навушниками.",
    },
    apparence: "Вигляд",
    theme: "Тема",
    themes: {
      clair: "Світла",
      sombre: "Темна",
      systeme: "Системна",
    },
    donnees: "Приватність і дані",
    donneesTexte:
      "Налаштування та історія зберігаються лише на цьому пристрої. Записи надсилаються для транскрипції й не зберігаються.",
    effacer: "Видалити історію",
    effacerQuestion: (n: number) => `Видалити ${sessionsAcc(n)} з історії?`,
    effacerConfirmer: "Видалити",
    efface: "Історію видалено.",
    apropos: "Про іспит TCF IRN",
    aproposTexte:
      "TCF IRN — це тест із французької мови, який вимагають у Франції для отримання посвідки на проживання та громадянства. Усний іспит складається з трьох завдань: entretien, interaction і point de vue. Зазвичай для багаторічної посвідки потрібен рівень A2, для посвідки резидента — B1, для громадянства — B2; перевірте актуальні вимоги на service-public.fr. Оцінки Каміли не замінюють офіційний іспит.",
    serveur: (adresse: string) => `Сервер: ${adresse}`,
  },
  erreurs: {
    reseau: "Немає з'єднання з API. Переконайтеся, що API запущено і телефон у тій самій мережі.",
    delai: "Каміла надто довго відповідала. Спробуйте ще раз.",
    reponse_invalide: "API відповів неочікувано. Переконайтеся, що застосунок і API оновлені.",
    requete_invalide: "Запит недійсний. Спробуйте ще раз.",
    session_introuvable: "Термін цієї сесії минув. Почніть нову.",
    session_occupee: "Каміла ще відповідає. Зачекайте хвилинку.",
    session_terminee: "Сесію завершено. Перегляньте відгук.",
    sans_reponse: "Ви ще не відповіли Камілі.",
    audio_trop_long: "Запис надто довгий. Спробуйте коротшу відповідь.",
    audio_format: "Цей аудіоформат не підтримується.",
    audio_vide: "У записі нічого не чути. Спробуйте ще раз.",
    service_indisponible: "Каміла зараз недоступна. Спробуйте трохи пізніше.",
    inconnu: "Щось пішло не так. Спробуйте ще раз.",
    trop_court_maintenir: "Запис надто короткий. Утримуйте мікрофон, поки говорите.",
    trop_court: "Запис надто короткий. Спробуйте ще раз.",
    non_autorise: "Застосунок не має доступу до API: ключ доступу відсутній або неправильний.",
    trop_de_requetes: "Забагато запитів за короткий час. Зачекайте кілька хвилин.",
  },
};
