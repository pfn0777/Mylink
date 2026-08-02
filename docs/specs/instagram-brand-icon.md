# Spec: Instagram link turi uchun brend ikonka va rang

## Maqsad
Instagram link turi hozir umumiy `Camera` ikonkasi (lucide-react) va oddiy
fuchsia rangda ko'rsatiladi. Buni haqiqiy Instagram logotipiga o'xshash
ikonka va Instagram brendining gradient rangiga almashtirish.

## Nega kerak
lucide-react v1.x'da Instagram brand ikonkasi yo'q (`AGENTS.md`/`CLAUDE.md`da
qayd etilgan gotcha), shuning uchun vaqtincha `Camera` ishlatilgan. Bu
foydalanuvchiga (mijoz biznes egasi va uning tashrifchilariga) chalkash
ko'rinadi — screenshot'da ko'rsatilganidek, admin panelda ham, public
sahifadagi tugmada ham Instagram logotipiga o'xshamaydi.

## Qamrov ICHIDA
- Instagram uchun inline SVG ikonka komponenti yaratish (haqiqiy Instagram
  glifiga o'xshash: yumaloq burchakli kvadrat korpus + o'rtada doira lens +
  yuqori o'ng burchakda kichik nuqta), monoxrom (`currentColor` bilan
  chiziladi, gradient fon ustida oq rangda ko'rinadi).
- `LINK_TYPE_META.instagram.icon` ni yangi ikonkaga almashtirish.
- `LINK_TYPE_META.instagram.badgeClass` (admin panel badge doirasi,
  `LinkRow.tsx`) va `LinkButton.tsx`dagi `TYPE_COLORS.instagram` ni haqiqiy
  Instagram gradientiga (sariq → to'q sariq → pushti → binafsha) o'zgartirish
  — Tailwind'ning tayyor `bg-gradient-to-tr from-* via-* to-*` utility
  klasslari bilan, qo'shimcha CSS yozmasdan.
- Public sahifadagi Instagram tugmasi (to'liq eni) va uning chap tarafidagi
  doira ikonkasi — ikkalasi ham gradient fonda bo'ladi.
- Hover holati uchun gradient stoplarini o'zgartirish o'rniga
  `hover:brightness-*` filter ishlatiladi (soddalik uchun).

## Qamrov TASHQARISIDA (bularni qilma!)
- Yangi npm dependency qo'shilmaydi (masalan `react-icons`) — inline SVG
  yetarli.
- Boshqa link turlari (phone, telegram, maps, custom) ikonkasi yoki rangi
  o'zgarmaydi.
- Har bir link uchun alohida rang tanlash (custom color picker) qo'shilmaydi
  — Instagram turi uchun rang qattiq belgilangan (fixed brand color) bo'lib
  qoladi, xuddi boshqa turlar kabi.
- QR generator/QrCustomizer logikasiga tegilmaydi.
- Component-darajasidagi UI test yozilmaydi (loyiha konvensiyasiga ko'ra —
  faqat business logic test qilinadi, bu esa sof vizual o'zgarish).

## Texnik
- Yangi fayl: `src/components/icons/InstagramIcon.tsx` — `{ className?: string }`
  qabul qiluvchi oddiy SVG komponent.
- O'zgaradigan fayl: `src/lib/link-type-meta.ts`
  - `LinkTypeMeta.icon` maydonining tipini `LucideIcon`dan kengroq
    `React.ComponentType<{ className?: string }>` ga o'zgartirish (chunki
    inline SVG komponent to'liq `LucideIcon` interfeysiga mos kelmaydi, lekin
    barcha chaqiruv joylarida faqat `className` prop ishlatiladi).
  - `instagram.icon` → `InstagramIcon`
  - `instagram.badgeClass` → gradient klasslar + `text-white` (masalan:
    `bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white`)
- O'zgaradigan fayl: `src/components/public/LinkButton.tsx`
  - `TYPE_COLORS.instagram.bg` → gradient klass
  - `TYPE_COLORS.instagram.hoverBg` → `hover:brightness-90` (yoki shunga
    yaqin)
- DB: yo'q. Migration: yo'q. Config: yo'q. Yangi dependency: yo'q.

## Qoidalar (EARS uslubida)
- QACHON admin Instagram turidagi link qatorini ko'rsa
  TIZIM chap tarafdagi type-badge doirasida Instagram-shakldagi ikonkani
  gradient fonda ko'rsatishi SHART.

- QACHON tashrifchi public sahifada Instagram tugmasini ko'rsa
  TIZIM tugma fonini va chap tarafdagi doira ikonkasini bir xil Instagram
  gradientida ko'rsatishi SHART
  VA ikonka rangi oq (`currentColor` orqali) bo'lishi SHART, gradient fonda
  yaxshi ko'rinishi uchun.

- QACHON boshqa link turlari (phone, telegram, maps, custom) render qilinsa
  TIZIM ularning ikonkasi va rangini o'zgartirMASLIGI SHART.

## Acceptance criteria
- [ ] `/businesses/[id]/edit` sahifasida Instagram link qatorining chap
      tomonidagi doira ikonkasi Instagram logotipiga o'xshaydi va gradient
      rangda.
- [ ] Public `/<slug>` sahifasida Instagram tugmasi (butun eni bo'ylab) va
      uning doira ikonkasi Instagram gradient rangida ko'rinadi.
- [ ] Boshqa 4 ta link turi (phone, telegram, maps, custom) vizual jihatdan
      o'zgarishsiz qoladi.
- [ ] `npm run typecheck && npm run lint && npm test && npm run build`
      xatosiz o'tadi.
- [ ] Brauzerda qo'lda tekshiriladi: admin edit sahifasi va public sahifa,
      screenshot'dagi holatga solishtirilib.
