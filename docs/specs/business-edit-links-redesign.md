# Spec: Biznesni tahrirlash sahifasini qayta dizayn qilish (linklar bilan birlashtirilgan forma)

## Maqsad
`/businesses/[id]/edit` sahifasini ikki ustunli layoutga o'tkazish (chapda biznes ma'lumotlari, o'ngda linklar — skrinshot 1 namunasi kabi), barcha o'zgarishlarni bitta "Saqlash" tugmasi bilan saqlash, va mavjud (saqlangan) linklarni joyida tahrirlash imkonini qo'shish. Har link turi o'z rangi/ikonkasi bilan ajralib tursin.

## Nega kerak
Hozir bu sahifada ikkita mustaqil forma bor: `BusinessForm` (nomi/tavsif/logo/slug, o'z "Saqlash" tugmasi) va `LinkEditor` (linklar — har bir qo'shish/o'chirish/tartib darhol serverga yoziladi). Bu:
- Foydalanuvchini chalg'itadi — ikkita alohida "saqlash" harakati bor gapdek.
- Mavjud linkni **tahrirlash umuman mumkin emas** — faqat o'chirib qayta qo'shish mumkin (skrinshot 2'da ko'rsatilgan asosiy muammo).
- Barcha linklar bir xil ko'rinishda — vizual jihatdan turi bo'yicha ajralib turmaydi.

## Qamrov ICHIDA
- `/businesses/[id]/edit` sahifasi ikki ustunli layout: chap ustun — biznes ma'lumotlari (Path/slug, Biznes nomi, Tavsif, Logo); o'ng ustun — Linklar ro'yxati + "+ Qo'shish" tugmasi.
- Bitta `<form>`, bitta "Saqlash" tugmasi pastda (butun kenglikda) — biznes ma'lumotlari **va** barcha link o'zgarishlari (qo'shilgan, tahrirlangan, o'chirilgan, qayta tartiblangan) shu bitta submit bilan birga saqlanadi.
- Mavjud (bazadan kelgan) linklar endi **joyida tahrirlanadi**: label va value inputlari to'g'ridan-to'g'ri ro'yxat ichida tahrirlanadigan (hozir faqat matn sifatida ko'rsatiladi, endi `<Input>` bo'ladi).
- "+ Qo'shish" bosilganda ro'yxatga yangi bo'sh qator (draft) qo'shiladi — turi (select/ikonka), label, value inputlari bilan, mavjud qatorlar bilan bir xil uslubda.
- Har bir qatorda "✕" o'chirish tugmasi — bosilganda qator draft holatda ro'yxatdan yashiriladi (DB'ga tegilmaydi).
- Haqiqiy drag-and-drop bilan qayta tartiblash (`@dnd-kit/core` + `@dnd-kit/sortable` qo'shiladi) — ☰ tutqichni ushlab linkni joyidan-joyga sudrash mumkin.
- Har link turi (`phone`, `telegram`, `instagram`, `maps`, `custom`) uchun alohida rang + lucide-react ikonka:
  - `phone` → yashil, `Phone` ikonka
  - `telegram` → ko'k, `Send` ikonka
  - `instagram` → pushti/binafsha, `Instagram` ikonka
  - `maps` → qizil, `MapPin` ikonka
  - `custom` → kulrang, `Link` ikonka
  - Har qator chap tomonida shu rangdagi doira fonli ikonka turadi.
- Saqlanmagan o'zgarish bo'lganda sahifadan chiqib ketishga urinilsa (tab yopish/URL o'zgartirish/orqaga) brauzer tasdiqlash dialogini ko'rsatish (`beforeunload` + client-side navigatsiya guard imkon qadar).
- Submit paytida validatsiya xatosi bo'lsa (masalan noto'g'ri telefon format), aynan shu xato bo'lgan link qatori qizil ramka/xato matni bilan belgilanadi, forma saqlanmaydi, qolgan barcha draft o'zgarishlar (input qiymatlari) yo'qolmaydi.
- `/businesses/new` sahifasi **o'zgarmaydi** — u yerda hali link qo'shib bo'lmaydi (biznes hali yaratilmagan), joriy `BusinessForm` shu ko'rinishda qoladi.

## Qamrov TASHQARISIDA (bularni qilma!)
- `/businesses/new` sahifasida link qo'shish imkoniyati — kelajakda alohida so'rov bo'lsa qaraladi.
- Linklar soniga limit qo'yish — hozircha cheklovsiz qoladi (hozirgi holat ham shunday).
- Rang/ikonka to'plamini foydalanuvchi sozlashi (custom rang tanlash UI) — hozircha faqat standart 5 ta rang qattiq kodlangan.
- Link turini tahrirlash paytida o'zgartirish validatsiyasi (masalan `phone` dan `telegram`ga o'tkazish) — mavjud qatorlar uchun turi o'zgartirilganda value formati mos kelmasligi mumkin, lekin bu submit paytidagi standart zod validatsiyasi bilan tutiladi, alohida real-time konvertatsiya logika qo'shilmaydi.
- Ko'p admin/parallel tahrirlash konflikti (ikki admin bir vaqtda saqlasa) — loyihada bitta admin bor, bu holat inobatga olinmaydi.

## Texnik
- **O'zgaradigan/yangi komponentlar**:
  - `src/components/admin/BusinessForm.tsx` — o'zgarmaydi (faqat `/new` uchun qoladi).
  - `src/components/admin/LinkEditor.tsx` — o'chiriladi, o'rniga yangi komponent yoziladi.
  - Yangi: `src/components/admin/BusinessEditForm.tsx` — ikki ustunli layout, biznes fieldlari + linklar draft state (`useState`) ni birlashtirgan yagona `<form>`. Draft link'lar massivi client state'da saqlanadi (`{ id: string; isNew: boolean; type; label; value; position }[]`), yangi qatorlar uchun `crypto.randomUUID()` bilan vaqtinchalik id.
  - Yangi: `src/components/admin/LinkRow.tsx` (yoki shu faylning ichida) — bitta link qatori: rang/ikonka, label/value input, drag tutqich, ✕ tugma.
- **Server Action**: `src/lib/actions/businesses.ts` ichiga yangi `updateBusinessWithLinks(businessId, prevState, formData)` qo'shiladi (yoki mavjud `updateBusiness` shu funksiyaga almashtiriladi). Linklar massivi FormData ichida yashirin JSON maydon orqali yuboriladi (`formData.get("linksJson")` → `JSON.parse` → zod bilan array validatsiya, har elementga mavjud `LinkInput` sxemasi + `id`/`isNew`/`position`).
  - `src/lib/actions/links.ts` dagi `addLink`, `deleteLink`, `moveLink` — endi ishlatilmay qoladi, o'chiriladi. `getLinksForBusiness` saqlanadi (edit sahifasi uni SSR'da chaqiradi).
- **DB**: `src/lib/db/schema.ts` o'zgarmaydi — mavjud `links` jadvali (id, businessId, type, label, value, position) yetarli.
- **Muhim texnik cheklov**: loyiha `drizzle-orm/neon-http` (`@neondatabase/serverless`) drayveridan foydalanadi — bu drayverda `.transaction()` **umuman mavjud emas** (`throw new Error("No transactions support in neon-http driver")`). Buning o'rniga **`db.batch([...])`** ishlatiladi — Neon HTTP batch endpoint orqali bir nechta mustaqil query'ni bitta haqiqiy tranzaksiyada bajaradi (statementlar orasida oraliq natijani o'qib bo'lmaydi, hammasi oldindan tayyor bo'lishi shart). Bizning holatda bu muammo emas: barcha mavjud link ID'lari `getLinksForBusiness` orqali oldindan ma'lum, yangi linklar uchun ID client tomonda `crypto.randomUUID()` bilan generatsiya qilinadi (server buni tekshiradi va shu ID bilan insert qiladi) — shuning uchun bitta `db.batch()` ichida: biznes `update` + har bir mavjud link uchun `update` + o'chirilganlar uchun bitta `delete ... where id in (...)` + yangi linklar uchun bitta multi-row `insert` (`position` qiymati client'dan kelgan tartib bo'yicha) — barchasi mustaqil statementlar sifatida bajariladi.
- **Yangi dependency**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (`npm install`).
- **Ikonkalar**: mavjud `lucide-react` kutubxonasidan (`Phone`, `Send`, `Instagram`, `MapPin`, `Link`, `GripVertical` — tutqich uchun).
- **Reserved/slug validatsiya, logo yuklash** — mavjud logika (`validateSlugFormat`, `uploadLogoIfProvided`) o'zgarishsiz qayta ishlatiladi.

## Qoidalar (EARS uslubida)
- QACHON admin "Saqlash" tugmasini bossa
  VA barcha fieldlar (biznes + linklar) valid bo'lsa
  TIZIM biznes ma'lumotlarini yangilashi SHART
  VA barcha draft link o'zgarishlarini (qo'shilgan/tahrirlangan/o'chirilgan/qayta tartiblangan) bitta tranzaksiyada DB'ga yozishi SHART
  VA muvaffaqiyatli saqlangach `/dashboard`ga redirect qilishi SHART.

- QACHON admin "+ Qo'shish" bosса
  TIZIM ro'yxatga yangi bo'sh draft qator qo'shishi SHART
  VA bu qator hali DB'ga yozilmasligi SHART (faqat "Saqlash" bosilganda).

- QACHON admin biror qatorning "✕" tugmasini bossa
  TIZIM qatorni draft ro'yxatdan olib tashlashi SHART
  VA "Saqlash" bosilmaguncha DB'dagi yozuvga tegmasligi SHART.

- QACHON admin ☰ tutqichni ushlab qatorni boshqa joyga sudrasa
  TIZIM draft ro'yxat tartibini yangilashi SHART
  VA yangi tartib faqat "Saqlash" bosilganda `position` ustunlariga yozilishi SHART.

- AGAR submit paytida biror link uchun validatsiya xatosi bo'lsa (masalan `phone` formati noto'g'ri)
  TIZIM hech qanday o'zgarishni saqlaMASligi SHART
  VA xato bo'lgan aniq qatorni belgilashi SHART
  VA foydalanuvchi kiritgan barcha draft qiymatlarni saqlab qolishi (yo'qotmasligi) SHART.

- AGAR sahifada saqlanmagan draft o'zgarish bo'lsa va admin sahifani tark etmoqchi bo'lsa (tab yopish/URL o'zgartirish)
  TIZIM tasdiqlash ogohlantirishini ko'rsatishi SHART.

- AGAR admin `requireAdminSession()` orqali autentifikatsiyadan o'tmagan bo'lsa
  TIZIM Server Action'ni bajarMASligi SHART (mavjud xatti-harakat, o'zgarmaydi).

## Acceptance criteria (tugadi deganda)
- [ ] `/businesses/[id]/edit` ikki ustunli layout: chapda biznes fieldlari, o'ngda linklar ro'yxati + "+ Qo'shish".
- [ ] Sahifada faqat bitta "Saqlash" tugmasi bor, u pastda, butun kenglikda.
- [ ] Mavjud link label/value'sini to'g'ridan-to'g'ri ro'yxatda tahrirlash mumkin, "Saqlash" bosilgach o'zgarish DB'da saqlanadi.
- [ ] Yangi link qo'shish, o'chirish, drag-and-drop bilan tartib o'zgartirish — barchasi faqat "Saqlash" bosilgach DB'ga aks etadi (draft sahifadan chiqib ketilsa yo'qoladi).
- [ ] Har link turi o'ziga xos rang + ikonka bilan chapdan ajralib turadi (phone/telegram/instagram/maps/custom).
- [ ] Noto'g'ri qiymat (masalan yaroqsiz telefon raqami) bilan saqlashga urinilsa — xato aynan shu qatorda ko'rsatiladi, boshqa draft o'zgarishlar yo'qolmaydi.
- [ ] Saqlanmagan o'zgarish bilan sahifadan chiqishga urinilsa ogohlantirish chiqadi.
- [ ] `/businesses/new` sahifasi eskisidek ishlayveradi (link qo'shish yo'q).
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` — barchasi xatosiz o'tadi.
- [ ] Brauzerda qo'lda tekshirilgan: biznes yaratish → tahrirlashga o'tish → link qo'shish/tahrirlash/o'chirish/tartib o'zgartirish → Saqlash → o'zgarishlar public sahifada (`/<slug>`) to'g'ri aks etishi.
