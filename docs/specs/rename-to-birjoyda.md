# Spec: Loyihani "Mylink" dan "BirJoyda" ga qayta nomlash

## Maqsad
Loyihaning barcha ko'rinadigan va texnik joylardagi nomini "Mylink" / "MyLink"
dan "BirJoyda" ga o'zgartirish — kod, config, session, va dokumentatsiya
izchil bitta nom ishlatsin.

## Nega kerak
Loyiha nomi "BirJoyda" ga o'zgartirilmoqda (brending qarori). Hozir "Mylink"
nomi kodning bir necha joyida (package nomi, sahifa sarlavhasi, footer matni,
session cookie nomi) va barcha docs faylларида qattiq yozilgan — buni izchil
yangilash kerak, aks holda kod va docs eskirgan nomni ko'rsatib chalkashlik
tug'diradi.

## Qamrov ICHIDA
- `package.json` dagi `"name"` maydonini `"mylink-clone"` dan `"birjoyda"` ga
  o'zgartirish va `package-lock.json` ni shunga mos yangilash (`npm install`).
- `src/app/layout.tsx` dagi sahifa metadata title'ini "MyLink Clone" dan
  "BirJoyda" ga o'zgartirish.
- `src/components/public/PublicBusinessPage.tsx` dagi "Powered by MyLink"
  matnini "Powered by BirJoyda" ga o'zgartirish.
- `src/lib/auth/session.ts` dagi `SESSION_COOKIE_NAME` qiymatini
  `"mylink_session"` dan `"birjoyda_session"` ga o'zgartirish.
- `docs/specs/mylink-spec.md` faylini `docs/specs/birjoyda-spec.md` ga rename
  qilish va ichidagi "Mylink" so'zlarini "BirJoyda" ga almashtirish.
- `docs/intent/mylink.md` faylini `docs/intent/birjoyda.md` ga rename qilish
  va ichidagi matnni yangilash.
- `CLAUDE.md` dagi loyiha tavsifi va `docs/specs/mylink-spec.md` /
  `docs/intent/mylink.md` ga bo'lgan havolalarni yangi fayl nomlariga va yangi
  loyiha nomiga moslab yangilash.
- `tasks/plan.md` va `tasks/todo.md` dagi "Mylink" so'zi uchraydigan matnlarni
  yangilash.

## Qamrov TASHQARISIDA (bularni qilma!)
- **Lokal papka nomi** (`C:\Users\user\Documents\Mylink`) — o'zgartirilmaydi.
  Bu OS darajasidagi harakat, IDE/terminal sessiyalarini buzishi mumkin,
  alohida qo'lda qilinadigan qadam.
- **Vercel loyiha nomi va live domen** (`mylink-clone.vercel.app`) —
  foydalanuvchi aniq "tegma" dedi. Kelajakda alohida spec/qadam sifatida
  qilinadi.
- **GitHub repo nomi** — so'ralmagan, tegilmaydi.
- `site-audit-report.md` — bu o'tgan auditning statik natijasi (tarixiy
  hujjat), rename qilinmaydi.
- `tests/unit/validation.test.ts` va `tests/unit/qr.test.ts` dagi
  `mylink_support`, `mylink-clone.app` kabi qiymatlar — bular test uchun
  ixtiyoriy namuna qiymatlar (haqiqiy loyiha nomiga bog'liq emas), o'zgarishi
  shart emas.

## Texnik
- Config: `package.json` (`name` maydoni) → keyin `npm install` bilan
  `package-lock.json` avtomatik yangilanadi.
- UI: `src/app/layout.tsx` (metadata.title), `src/components/public/PublicBusinessPage.tsx`
  (footer matni).
- Auth: `src/lib/auth/session.ts` (`SESSION_COOKIE_NAME` konstantasi).
- Docs: `CLAUDE.md`, `docs/specs/mylink-spec.md` → `birjoyda-spec.md`,
  `docs/intent/mylink.md` → `birjoyda.md`, `tasks/plan.md`, `tasks/todo.md`.
- DB: o'zgarish yo'q.
- Migration: kerak emas.

## Qoidalar (logika — EARS uslubida)
- QACHON `SESSION_COOKIE_NAME` qiymati o'zgartirilsa
  VA loyiha qayta deploy qilinsa
  TIZIM eski `mylink_session` cookie'sini tanimaydi SHART
  VA admin qayta login qilishi kerak bo'ladi SHART (bu kutilgan holat,
  xato emas).

- AGAR biror joyda "Mylink" so'zi qoldirib ketilsa (masalan yangi kod yoki
  eski cache'langan build)
  TIZIM funksional buzilmaydi SHART (bu faqat matn/branding masalasi)
  VA keyingi tozalashda tuzatiladi SHART.

## Acceptance criteria (tugadi deganda)
- [ ] Repo bo'ylab `grep -ri mylink` qidiruvi faqat "Qamrov TASHQARISIDA"da
      sanab o'tilgan fayllarda (site-audit-report.md, test fixture qiymatlari)
      va `node_modules`/`package-lock.json` ichidagi tashqi paket nomlarida
      (agar mavjud bo'lsa) qoladi — boshqa joyda qolmaydi.
- [ ] `package.json` → `"name": "birjoyda"`.
- [ ] Brauzer tab sarlavhasi "BirJoyda" ko'rsatadi.
- [ ] Public sahifa footer'ida "Powered by BirJoyda" chiqadi.
- [ ] Session cookie nomi `birjoyda_session`.
- [ ] `docs/specs/birjoyda-spec.md` va `docs/intent/birjoyda.md` mavjud,
      eski nomlar (`mylink-spec.md`, `mylink.md`) endi yo'q.
- [ ] `CLAUDE.md` yangi fayl nomlariga to'g'ri havola qiladi.
- [ ] `npm run typecheck && npm run lint && npm test && npm run build`
      xatosiz o'tadi.

## Test
- [ ] Login qilib, admin sessiya cookie nomi `birjoyda_session` ekanini
      brauzer devtools'da tekshirish (cookie nomi o'zgargani uchun eski
      sessiyalar bekor bo'lishini tasdiqlash).
- [ ] `/<slug>` public sahifasini ochib, footer'da "Powered by BirJoyda"
      ko'rinishini tekshirish.
