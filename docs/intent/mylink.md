# Intent: MyLink Clone (nom hali tanlanmagan)

_Confirmed via interview-me skill, 2026-08-01._

## Outcome

mylink.asia'ga o'xshash, lekin mustaqil (boshqa nom bilan) link-in-bio + QR-kod
generator sayti. mylink.asia — referens/andoza sifatida ishlatilgan, egalik
qilinmaydi va kod bazasi ko'rilmagan; faqat UI oqimi kuzatilgan (screenshotlar
orqali).

## User

Faqat loyiha egasi (admin) tizimga kiradi. Mijoz-bizneslar (masalan "Dunyo
Uspa" — erkaklar kiyim do'koni) o'z akkountiga ega bo'lmaydi; admin ular uchun
sahifani tayyorlab, tayyor link + QR kodni taqdim etadi.

## Why now

Foydalanuvchi mylink.asia'da demo sifatida "Dunyo Uspa" biznes sahifasini
yaratib sinab ko'rgan. Endi shu oqimga tayanib, mustaqil (uchinchi tomonga
bog'liq bo'lmagan) o'z versiyasini qurmoqchi.

## Core flow (referensdan olingan, screenshotlar asosida)

1. Admin biznes yaratadi: nomi, tavsif, logo (path/slug bilan).
2. Linklar qo'shiladi: telefon, Telegram, Instagram, Google Maps (joylashuv),
   erkin/custom link (istalgan nom + URL).
3. Public sahifa avtomatik generatsiya bo'ladi (masalan `/dunyouspa`) —
   dumaloq logo, biznes nomi, tavsif, rangli tugmalar.
4. Shu public sahifa uchun QR kod generatsiya qilinadi — sozlanadigan: rang,
   fon rangi, o'lcham, PNG/SVG formatda yuklab olish.
5. Admin bir nechta bizneslarni ro'yxatda ("Mening bizneslarim") boshqaradi —
   yaratish, tahrirlash, ko'rish.
6. Auth — faqat admin uchun oddiy login (himoya maqsadida).

## Success criteria

- Admin panel: biznes CRUD (nomi, tavsif, logo, slug).
- Har bir biznesga cheksiz/erkin miqdorda link qo'shish mumkin (turlar:
  telefon, Telegram, Instagram, Maps, custom).
- Public sahifa slug orqali ochiladi va barcha linklarni tugma sifatida
  ko'rsatadi.
- Har bir public sahifa uchun sozlanadigan QR kod (rang/o'lcham/format)
  generatsiya va yuklab olish mumkin.
- Bizneslar ro'yxati sahifasi — bir nechta mijozni boshqarish.

## Constraint

- Stack: Next.js + Supabase (Postgres + Auth + Storage — logo uchun) +
  Vercel hosting (mavjud MCP sozlamalariga mos).
- Domen/brend nomi hali tanlanmagan — boshida Vercel subdomain bilan
  ishlanadi, keyinroq real domen ulanadi.
- Dizayn: tayyor uslub berilmagan — link-in-bio saytlaridan (internetdan)
  ilhom olib, mos variant tanlanadi (implementatsiya bosqichida).

## Out of scope (v1)

- Ochiq (public) ro'yxatdan o'tish — boshqa bizneslar o'zi ro'yxatdan
  o'tolmaydi, faqat admin orqali qo'shiladi.
- To'lov integratsiyasi (Payme/Click) va pullik tariflar.
- Referal dasturi.
- Analitika (link bosishlar statistikasi) — keyingi faza.

## Next step

Texnik spec yozish (spec-driven-development skill) — ma'lumotlar bazasi
sxemasi, sahifalar tuzilishi, API/route'lar — so'ng `/plan` bilan
bosqichlarga bo'lish.
