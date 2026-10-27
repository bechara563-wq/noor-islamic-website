/**
 * Noor Extended Seed — Tafsir Al-Muyassar, Reciters Library, Ask Noor Knowledge Base
 * Run: npx tsx src/db/seed-extended.ts
 */
import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { normalizeArabic } from "../lib/arabic";
import { askNoorQa, reciters, tafsirs } from "./schema";

const TAFSIR_URL = "https://api.alquran.cloud/v1/quran/ar.muyassar";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

type TafsirAyah = {
  number: number;
  text: string;
  numberInSurah: number;
};
type TafsirSurah = {
  number: number;
  ayahs: TafsirAyah[];
};

const RECITERS_DATA = [
  {
    slug: "alafasy",
    name: "مشاري بن راشد العفاسي",
    nameEn: "Mishary Rashid Alafasy",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server8.mp3quran.net/afs/",
    surahCount: 114,
    sortOrder: 1,
  },
  {
    slug: "abdulbasit",
    name: "عبد الباسط عبد الصمد",
    nameEn: "Abdul Basit Abdul Samad",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server7.mp3quran.net/basit/",
    surahCount: 114,
    sortOrder: 2,
  },
  {
    slug: "alhusary",
    name: "محمود خليل الحصري",
    nameEn: "Mahmoud Khalil Al-Husary",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server13.mp3quran.net/husr/",
    surahCount: 114,
    sortOrder: 3,
  },
  {
    slug: "almuaiqly",
    name: "ماهر بن حمد المعيقلي",
    nameEn: "Maher Al-Muaiqly",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server12.mp3quran.net/maher/",
    surahCount: 114,
    sortOrder: 4,
  },
  {
    slug: "alghamdi",
    name: "سعد بن سعيد الغامدي",
    nameEn: "Saad Al-Ghamdi",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server7.mp3quran.net/s_gmd/",
    surahCount: 114,
    sortOrder: 5,
  },
  {
    slug: "alsudais",
    name: "عبد الرحمن السديس",
    nameEn: "Abdul Rahman Al-Sudais",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server11.mp3quran.net/sds/",
    surahCount: 114,
    sortOrder: 6,
  },
  {
    slug: "alshuraim",
    name: "سعود بن إبراهيم الشريم",
    nameEn: "Saud Al-Shuraim",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server7.mp3quran.net/shur/",
    surahCount: 114,
    sortOrder: 7,
  },
  {
    slug: "aldossari",
    name: "ياسر بن راشد الدوسري",
    nameEn: "Yasser Al-Dossari",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server11.mp3quran.net/yasser/",
    surahCount: 114,
    sortOrder: 8,
  },
  {
    slug: "alajmy",
    name: "أحمد بن علي العجمي",
    nameEn: "Ahmed Al-Ajmy",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server10.mp3quran.net/ajm/",
    surahCount: 114,
    sortOrder: 9,
  },
  {
    slug: "alqattami",
    name: "ناصر بن علي القطامي",
    nameEn: "Nasser Al-Qatami",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server6.mp3quran.net/qtm/",
    surahCount: 114,
    sortOrder: 10,
  },
  {
    slug: "alhuthaify",
    name: "علي بن عبد الرحمن الحذيفي",
    nameEn: "Ali Al-Huthaify",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server9.mp3quran.net/hthfi/",
    surahCount: 114,
    sortOrder: 11,
  },
  {
    slug: "minshawi",
    name: "محمد صديق المنشاوي",
    nameEn: "Mohamed Siddiq El-Minshawi",
    rewaya: "حفص عن عاصم",
    style: "مرتل",
    serverUrl: "https://server10.mp3quran.net/minsh/",
    surahCount: 114,
    sortOrder: 12,
  },
];

const QA_DATA = [
  {
    category: "القرآن الكريم",
    question: "ما هو فضل قراءة القرآن الكريم يوميًا؟",
    answer:
      "قراءة القرآن الكريم من أعظم القربات؛ فبكل حرف حسنة، والحسنة بعشر أمثالها. قال رسول الله ﷺ: «من قرأ حرفًا من كتاب الله فله به حسنة، والحسنة بعشر أمثالها، لا أقول الم حرف، ولكن ألف حرف ولام حرف وميم حرف». كما أن القرآن يأتي يوم القيامة شفيعًا لأصحابه.",
    source: "صحيح الترمذي (٢٩١٠) وصحيح مسلم (٨٠٤)",
    keywords: "فضل تلاوة أجر ثواب قراءة القرآن شفيع",
    sortOrder: 1,
  },
  {
    category: "القرآن الكريم",
    question: "ما هي السورة التي تسمى قلب القرآن وما فضلها؟",
    answer:
      "اشتهر إطلاق «قلب القرآن» على سورة يس لاهتمامها بأصول الإيمان والبعث والرسالة والتوحيد، وجاء في فضل قراءتها أحاديث متعددة تدل على عظم شأنها وتدبرها في حياة المسلم.",
    source: "تفسير ابن كثير ومجموع الفتاوى",
    keywords: "سورة يس قلب القرآن فضل يس",
    sortOrder: 2,
  },
  {
    category: "القرآن الكريم",
    question: "ما فضل قراءة سورة الكهف يوم الجمعة؟",
    answer:
      "يندب قراءة سورة الكهف في يوم الجمعة وليلتها؛ لقول النبي ﷺ: «من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين». ووقتها يبدأ من غروب شمس يوم الخميس إلى غروب شمس يوم الجمعة.",
    source: "رواه الحاكم والبيهقي وصححه الألباني",
    keywords: "سورة الكهف الجمعة نور فضل الكهف",
    sortOrder: 3,
  },
  {
    category: "القرآن الكريم",
    question: "ما هي أعظم آية في كتاب الله؟",
    answer:
      "أعظم آية في القرآن هي «آية الكرسي» (البقرة: ٢٥٥)؛ لما اشتملت عليه من توحيد الله وعظمته وأسمائه الحسنى وصفاته العلى. ومن قرأها دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.",
    source: "صحيح مسلم (٨١٠) والنسائي في السنن الكبرى",
    keywords: "اية الكرسي اعظم اية فضل اية الكرسي",
    sortOrder: 4,
  },
  {
    category: "الصلاة",
    question: "كيف أحقق الخشوع في الصلاة؟",
    answer:
      "يتحقق الخشوع بعدة أمور: أولاً استشعار الوقوف بين يدي الله تعالى، ثانيًا تدبر ما يُقرأ من الآيات والأذكار، ثالثًا الطمأنينة في الركوع والسجود والقيام، رابعًا إبعاد المشغلات والمشتتات قبل الدخول في الصلاة، وخامسًا استحضار أن الصلاة قد تكون صلاة مودع.",
    source: "صحيح البخاري ومسلم ومدارج السالكين",
    keywords: "الخشوع الصلاة طمأنينة تدبر وسوسة",
    sortOrder: 5,
  },
  {
    category: "الصلاة",
    question: "ما هو حكم صلاة الوتر وكيف تصلى؟",
    answer:
      "صلاة الوتر سنة مؤكدة حث عليها النبي ﷺ وقال: «إن الله وتر يحب الوتر فأوتروا يا أهل القرآن». وأقلها ركعة واحدة، وأفضلها ثلاث أو خمس أو سبع أو إحدى عشرة ركعة، ووقتها من بعد صلاة العشاء إلى طلوع الفجر الثاني.",
    source: "صحيح البخاري ومسلم والسنن الأربعة",
    keywords: "الوتر صلاة الوتر قيام الليل ركعات",
    sortOrder: 6,
  },
  {
    category: "الصلاة",
    question: "ما هي السنن الرواتب وما فضلها؟",
    answer:
      "السنن الرواتب اثنتا عشرة ركعة في اليوم والليلة: ٤ قبل الظهر وركعتان بعدها، وركعتان بعد المغرب، وركعتان بعد العشاء، وركعتان قبل الفجر. قال النبي ﷺ: «من صلّى في يوم وليلة اثنتي عشرة ركعة بُني له بيت في الجنة».",
    source: "صحيح مسلم (٧٢٨)",
    keywords: "السنن الرواتب نوافل بيت في الجنة ركعات",
    sortOrder: 7,
  },
  {
    category: "الصلاة",
    question: "ماذا يفعل من شك في عدد الركعات أثناء الصلاة؟",
    answer:
      "من شك في صلاته فلم يدرِ كم صلى، ثلاثًا أم أربعًا، بنى على اليقين وهو الأقل (أي يجعلها ثلاثًا ويكمل صلاته)، ثم يسجد سجدتين للسهو قبل السلام أو بعده، لحديث أبي سعيد الخدري في صحيح مسلم.",
    source: "صحيح مسلم (٥٧١)",
    keywords: "سجود السهو شك عدد الركعات نسيان الصلاة",
    sortOrder: 8,
  },
  {
    category: "الأذكار",
    question: "ما هو أفضل وقت لقراءة أذكار الصباح والمساء؟",
    answer:
      "أفضل وقت لأذكار الصباح يبدأ من طلوع الفجر إلى شروق الشمس، ويمتد إلى الزوال عند الحاجة. وأفضل وقت لأذكار المساء يبدأ من بعد صلاة العصر إلى غروب الشمس، ويمتد إلى ثلث الليل الأول.",
    source: "شرح رياض الصالحين ومجموع فتاوى ابن عثيمين",
    keywords: "وقت اذكار الصباح المساء شروق غروب",
    sortOrder: 9,
  },
  {
    category: "الأذكار",
    question: "ما هو سيد الاستغفار وما فضله؟",
    answer:
      "سيد الاستغفار هو: «اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك عليَّ، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت». من قاله موقنًا به حين يمسي فمات دخل الجنة، وكذلك إذا أصبح.",
    source: "صحيح البخاري (٦٣٠٦)",
    keywords: "سيد الاستغفار دعاء مغفرة ذنوب",
    sortOrder: 10,
  },
  {
    category: "الأذكار",
    question: "ما فضل قول: «لا حول ولا قوة إلا بالله»؟",
    answer:
      "قول «لا حول ولا قوة إلا بالله» كنز من كنوز الجنة، وهي كلمة استسلام وتفويض الأمر لله تعالى وإقرار بالعجز إلا بمعونته وتوفيقه، وتدفع الهموم والكروب.",
    source: "صحيح البخاري (٤٢٠٥) وصحيح مسلم (٢٧٠٤)",
    keywords: "الحوقلة لا حول ولا قوة الا بالله كنز الجنة",
    sortOrder: 11,
  },
  {
    category: "الأذكار",
    question: "ما هو الذكر الذي يثقل الميزان وحبيب إلى الرحمن؟",
    answer:
      "قال النبي ﷺ: «كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم». وهي ختام صحيح الإمام البخاري.",
    source: "صحيح البخاري (٦٦٨٢) وصحيح مسلم (٢٦٩٤)",
    keywords: "سبحان الله وبحمده الميزان حبيبتان للرحمن",
    sortOrder: 12,
  },
  {
    category: "الطهارة",
    question: "ما هي فرائض الوضوء وسننه؟",
    answer:
      "فرائض الوضوء ستة بنص القرآن (المائدة: ٦): ١. غسل الوجه (ومنه المضمضة والاستنشاق)، ٢. غسل اليدين إلى المرفقين، ٣. مسح الرأس كاملًا، ٤. غسل الرجلين إلى الكعبين، ٥. الترتيب، ٦. الموالاة. أما السنن فمنها التسمية، والسواك، وتثليث الغسل، وتخليل الأصابع واللحية، والبدء باليمين.",
    source: "القرآن الكريم (المائدة: ٦) والسنن الفقهية المعتمدة",
    keywords: "فرائض الوضوء سنن الطهارة كيفية الوضوء",
    sortOrder: 13,
  },
  {
    category: "الطهارة",
    question: "متى يشرع التيمم وكيف يصح؟",
    answer:
      "يشرع التيمم عند تعذر استعمال الماء لفقده أو لمرض يُخاف معه الضرر. وصفته: ضربة واحدة بالأرض الطاهرة بيديه، ثم يمسح بهما وجهه وظاهر كفيه، ناوياً رفع الحدث أو استباحة الصلاة.",
    source: "القرآن الكريم (النساء: ٤٣) وصحيح البخاري (٣٣٨)",
    keywords: "التيمم فقد الماء طهارة تراب",
    sortOrder: 14,
  },
  {
    category: "الصيام",
    question: "ما هي مفسدات الصيام التي تجب مراعاتها؟",
    answer:
      "مفسدات الصيام الأساسية هي: الأكل والشرب عمدًا، الجماع، الاستقاءة عمدًا (إخراج القيء عمدًا)، خروج دم الحيض والنفاس، وما كان في معنى الأكل والشرب كالإبر المغذية. أما ما كان نسيانًا أو غير مقصود كالغبار وبخاخ الربو وقطرة العين فلا يفسد الصيام.",
    source: "فتاوى كبار العلماء واللجنة الدائمة",
    keywords: "مبطلات الصيام مفسدات رمضان قطرة بخاخ",
    sortOrder: 15,
  },
  {
    category: "الصيام",
    question: "ما هو فضل صيام الست من شوال؟",
    answer:
      "قال رسول الله ﷺ: «من صام رمضان ثم أتبعه ستًا من شوال كان كصيام الدهر». والحسنة بعشر أمثالها؛ فصيام رمضان يعادل عشرة أشهر، وصيام الست يعادل شهرين، فيكتمل أجر سنة كاملة.",
    source: "صحيح مسلم (١١٦٤)",
    keywords: "ستة من شوال صيام الدهر صيام التطوع",
    sortOrder: 16,
  },
  {
    category: "معاملات وأخلاق",
    question: "ما هو بر الوالدين في حياة الوالدين وبعد مماتهما؟",
    answer:
      "برهما في حياتهما: طاعتهما بالمعروف، ولين الجانب، وخفض جناح الذل لهما، والإنفاق عليهما، وإدخال السرور عليهما. وبعد مماتهما: بالدعاء والاستغفار لهما، وإنفاذ عهدهما ووصيتهما، وصلة الرحم التي لا توصل إلا بهما، وإكرام صديقهما.",
    source: "القرآن الكريم (الإسراء: ٢٣-٢٤) وصحيح مسلم (١٦٣٨)",
    keywords: "بر الوالدين طاعة الوالدين الدعاء للام والاب",
    sortOrder: 17,
  },
  {
    category: "معاملات وأخلاق",
    question: "ما هي علامات التوبة النصوح وكيف تقبل؟",
    answer:
      "شروط التوبة الصادقة: ١. الإقلاع عن الذنب فورًا، ٢. الندم الصادق على ما فات، ٣. العزم الجازم على عدم العودة إليه، ٤. رد المظالم إلى أهلها إن كان الذنب يتعلق بحق إنسان. وإذا تحققت هذه الشروط قَبِل الله التوبة تفضلًا منه ورحمة.",
    source: "القرآن الكريم (التحريم: ٨) ومجموع الفتاوى",
    keywords: "التوبة النصوح شروط التوبة رد المظالم الاستغفار",
    sortOrder: 18,
  },
];

async function main() {
  /* ---------------------- 1. Seed Tafsir Al-Muyassar ---------------------- */
  console.log("→ Fetching Tafsir Al-Muyassar from AlQuran Cloud…");
  const res = await fetch(TAFSIR_URL);
  if (!res.ok) throw new Error(`Tafsir fetch failed: HTTP ${res.status}`);
  const json = (await res.json()) as { data: { surahs: TafsirSurah[] } };
  const surahsData = json.data.surahs;

  console.log("→ Clearing existing tafsirs…");
  await db.delete(tafsirs);

  console.log("→ Inserting 6236 tafsir verses…");
  const CHUNK = 1000;
  let totalTafsirs = 0;
  for (const s of surahsData) {
    const rows = s.ayahs.map((a) => ({
      surahId: s.number,
      numberInSurah: a.numberInSurah,
      text: a.text.trim(),
    }));
    totalTafsirs += rows.length;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await db.insert(tafsirs).values(rows.slice(i, i + CHUNK));
    }
  }
  console.log(`✓ Inserted ${totalTafsirs} tafsir verses (Al-Muyassar)`);

  /* ------------------------- 2. Seed Reciters ------------------------- */
  console.log("→ Clearing & inserting reciters…");
  await db.delete(reciters);
  await db.insert(reciters).values(RECITERS_DATA);
  console.log(`✓ Inserted ${RECITERS_DATA.length} reciters with verified CDNs`);

  /* ------------------------ 3. Seed Ask Noor QA ----------------------- */
  console.log("→ Clearing & inserting Ask Noor knowledge base…");
  await db.delete(askNoorQa);
  await db.insert(askNoorQa).values(
    QA_DATA.map((q) => ({
      category: q.category,
      question: q.question,
      questionNormalized: normalizeArabic(q.question),
      answer: q.answer,
      source: q.source,
      keywords: q.keywords,
      views: 0,
      sortOrder: q.sortOrder,
    }))
  );
  console.log(`✓ Inserted ${QA_DATA.length} verified Ask Noor Q&A items`);

  console.log("Extended seed completed successfully.");
  await pool.end();
}

main().catch(async (err) => {
  console.error("Extended seed error:", err);
  await pool.end();
  process.exit(1);
});
