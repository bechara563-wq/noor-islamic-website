export type NavItem = {
  href: string;
  label: string;
  labelEn: string;
};

export const mainNav: NavItem[] = [
  { href: "/", label: "الرئيسية", labelEn: "Home" },
  { href: "/quran", label: "القرآن", labelEn: "Quran" },
  { href: "/adhkar", label: "الأذكار", labelEn: "Adhkar" },
  { href: "/tools", label: "الأدوات", labelEn: "Tools" },
  { href: "/search", label: "البحث", labelEn: "Search" },
  { href: "/ask", label: "اسأل نور", labelEn: "Ask Noor" },
];

export const bottomNav: NavItem[] = [
  { href: "/", label: "الرئيسية", labelEn: "Home" },
  { href: "/quran", label: "القرآن", labelEn: "Quran" },
  { href: "/adhkar", label: "الأذكار", labelEn: "Adhkar" },
  { href: "/search", label: "البحث", labelEn: "Search" },
  { href: "/ask", label: "اسأل نور", labelEn: "Ask Noor" },
];

export const toolNav: NavItem[] = [
  { href: "/prayer-times", label: "مواقيت الصلاة", labelEn: "Prayer Times" },
  { href: "/qibla", label: "القبلة", labelEn: "Qibla" },
  { href: "/tasbeeh", label: "المسبحة", labelEn: "Tasbeeh" },
  { href: "/library", label: "مكتبة التلاوات", labelEn: "Recitations" },
];
