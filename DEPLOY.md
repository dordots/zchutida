# מדריך Deploy ל-Firebase Hosting

## הגדרה ראשונית

1. **התחברות ל-Firebase:**
   ```bash
   npm run firebase:login
   ```
   או
   ```bash
   firebase login
   ```

2. **בדיקת פרויקט:**
   - הפרויקט כבר מוגדר ב-`.firebaserc` עם ה-project ID: `zchutyeda`
   - אם צריך לשנות, ערוך את `.firebaserc`

## Deploy

### Deploy מלא (Build + Deploy):
```bash
npm run deploy
```

זה יבצע:
1. `npm run build` - בונה את האפליקציה
2. `firebase deploy --only hosting` - מעלה ל-Firebase Hosting

### Deploy רק Hosting (אם כבר ביצעת build):
```bash
npm run deploy:hosting
```

### Deploy רק Firestore Rules:
```bash
npm run deploy:firestore
```

## הגדרת דומיין מותאם אישית

1. **ב-Firebase Console:**
   - לך ל-Hosting
   - לחץ על "Add custom domain"
   - הזן את הדומיין שלך
   - עקוב אחר ההוראות (הוספת DNS records)

2. **SSL Certificate:**
   - Firebase מספק SSL אוטומטי
   - זה יכול לקחת כמה דקות עד כמה שעות

## URL של האפליקציה

לאחר ה-deploy, האפליקציה תהיה זמינה ב:
- `https://zchutyeda.web.app`
- `https://zchutyeda.firebaseapp.com`
- ואם הגדרת דומיין מותאם: `https://yourdomain.com`

## הערות חשובות

1. **Build Output:**
   - התיקייה `dist` נוצרת אחרי `npm run build`
   - היא מכילה את הקבצים הסטטיים שצריכים להיות ב-production

2. **Environment Variables:**
   - אם יש משתני סביבה, צריך להגדיר אותם ב-Firebase Functions או להשתמש ב-`.env.production`

3. **Firestore Rules:**
   - הכללים הנוכחיים מאפשרים read/write לכולם (לפיתוח)
   - **חשוב:** עדכן את הכללים ל-production עם authentication מתאים

4. **Cache:**
   - קבצי JS/CSS נשמרים ב-cache ל-1 שנה
   - אם צריך לעדכן, אפשר לעשות `firebase deploy --only hosting --force`

## Troubleshooting

- **שגיאת "Project not found":**
  - ודא ש-`.firebaserc` מכיל את ה-project ID הנכון
  - או הרץ `firebase use zchutyeda`

- **שגיאת "Permission denied":**
  - ודא שהתחברת: `firebase login`
  - ודא שיש לך הרשאות לפרויקט

- **האפליקציה לא עובדת אחרי deploy:**
  - בדוק את ה-console בדפדפן
  - ודא ש-Firebase config נכון
  - ודא ש-Firestore rules מאפשרים גישה


