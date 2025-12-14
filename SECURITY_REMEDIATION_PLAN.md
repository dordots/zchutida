# תוכנית פעולה טכנית לפי דוח האבטחה

מסמך זה מתרגם את ממצאי `PROJECT_AUDIT_REPORT.md` למשימות ביצוע מעשיות לפי סדר עדיפויות.

## שלב 0 – הכנות מיידיות
- לפתוח ענף hardening ולהקפיא דיפלוי עד סיום שלב הקריטי.
- לבצע גיבוי Firestore (export) ולהגדיר אפשרות rollback.
- להכין חשבון בדיקה עם שלושה משתמשי Auth: mentee, mentor, admin.

## שלב 1 – קריטי (יום 1–2)
1) Firestore Rules
- לעדכן `firestore.rules` לחוקים הסגורים בדוח ולפרוס עם `firebase deploy --only firestore:rules`.
- לבדוק עם חשבונות הבדיקה: קריאה/כתיבה מורשות בלבד ל-mentee/mentor/admin.

2) Firebase Secrets ל־env
- להעביר את config ל־env בקבצי Vite (`import.meta.env.VITE_*`) ולהסיר מפתחות קשיחים.
- ליצור `.env.local` עם כל המפתחות, להוסיף `.env*` ל־`.gitignore`, ולהריץ key rotation בקונסול Firebase.

3) אימות אמיתי במקום localStorage
- להסיר שימושים ב־`localStorage` ל־id number בכל הקבצים, ולהשתמש ב־Firebase Auth (signup/login/logout) מ־`src/firebase/auth.js`.
- להחליף גישת UID ב־routes: להוסיף Protected Routes ולהפנות לאימות אם אין `currentUser`.
- לעדכן קריאות Firestore כך ש־`request.auth.uid` הוא המקור היחיד להרשאות (חייב להתיישר עם החוקים החדשים).

## שלב 2 – הקשחת נתונים וולידציה (יום 3–4)
- להסיר אחסון מספרי זהות מכל מקום ב־localStorage או state לא מאובטח.
- להפעיל HTTPS enforcement ב־Firebase Hosting (`firebase.json` → redirects ל־https).
- להוסיף rate limiting בסיסי ב־rules (deny מעל X כתיבות לדקה לכל UID/מסמך).
- להוסיף ולידציה עם React Hook Form + Zod לטפסים: Login/Register/Eligibility Calculator.
  - בדיקת תקינות ת״ז (checksum), תאריכים, מגבלת גודל קובץ לפני העלאה.

## שלב 3 – ארכיטקטורה וביצועים (שבוע 1)
- Code splitting: להגדיר `manualChunks` ב־`vite.config.js` (react-vendor/ui-vendor/firebase).
- Lazy loading: להחליף imports ב־`src/pages/index.jsx` ל־`React.lazy` + `Suspense`.
- Error boundaries: להוסיף קומפוננטת ErrorBoundary ולעטוף את ה־`<Routes>` הראשי.
- להסיר `console.log/error` ב־production או לעטוף בבדיקה `import.meta.env.DEV`.

## שלב 4 – בדיקות ותיעוד (שבוע 2–3)
- להוסיף Vitest/Jest ל־logic קריטי (auth flow, calculator).
- לכתוב README מורחב: התקנה, env, build, deploy, מבנה פרויקט, זרימות עיקריות.
- ליישר טיפול שגיאות לפורמט אחיד (למשל החזרת `{ ok, error }` או exceptions עם catcher מרכזי).

## שלב 5 – החלטות וטיוב (שבוע 3–4)
- Base44 מול Firebase: לבחור פתרון יחיד; אם Firebase – להסיר Base44 SDK, לעדכן imports ולנקות קוד.
- להגדיר React Query cache בסיסי (staleTime/cacheTime) ולהוסיף service worker רק אם/כשנדרש.

## שלב 6 – שיפורי UX ואבטחה רכה (שבוע 4+)
- להוסיף loading states (skeletons), ולהחליף `alert` ב־toast דרך `src/components/ui/toaster.jsx`.
- לשפר נגישות: ARIA labels, keyboard navigation, contrast.
- לשקול מיגרציית TypeScript או JSDoc לקוד חדש.

## שלב 7 – תשתיות לטווח ארוך
- CI/CD: GitHub Actions להרצת lint/tests/build, ולהוסיף security scanning.
- Monitoring: Sentry או Firebase Crashlytics + performance monitoring.
- PWA: service worker, offline caching, manifest להתקנה.
- i18n (אם צריך): להכניס react-i18next עם fallback עברית/אנגלית.

## בדיקות מהירות בסוף כל שלב
- קריטי: בדיקות הרשאות ידניות/אוטומטיות ב־Firestore אחרי עדכון rules.
- אימות: התחברות/התנתקות/רישום, ניווט ל־Protected Routes, בדיקת token ב־DevTools Network.
- ביצועים: `npm run build` לבדוק פיצול bundles בגודל, ולהריץ `npm run preview` לבדיקת lazy loading.
- וולידציה: טפסים עם קלט לא תקין אמורים להציג שגיאות ללא שליחת בקשה.

## בעלויות ומשימות
- אחראי אבטחה: חותם על rules, rotation למפתחות, בודק הרשאות.
- פיתוח FE: הטמעת Auth, lazy loading, error boundary, ניקוי console.
- פיתוח BE/תצורה: firebase.json redirects, rate limiting ב־rules, הגדרות CI.
- QA: סקריפטי smoke לאחר כל שלב; במקרה בעיה – rollback מגיבוי Firestore.


