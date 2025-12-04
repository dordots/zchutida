# Firebase Setup Guide

## שלב 1: יצירת פרויקט Firebase

1. לך ל-[Firebase Console](https://console.firebase.google.com/)
2. לחץ על "Add project" או "הוסף פרויקט"
3. הזן שם לפרויקט (למשל: "zchut-yeda")
4. בחר אם להפעיל Google Analytics (אופציונלי)
5. לחץ "Create project"

## שלב 2: הוספת Web App

1. בפרויקט שיצרת, לחץ על האייקון של Web (`</>`)
2. הזן שם לאפליקציה (למשל: "Zchut Yeda Web")
3. **אל תסמן** את "Also set up Firebase Hosting" (לא נדרש כרגע)
4. לחץ "Register app"
5. העתק את ה-config object שמוצג

## שלב 3: הגדרת Authentication

1. בתפריט השמאלי, לחץ על "Authentication"
2. לחץ "Get started"
3. לחץ על "Email/Password"
4. הפעל "Email/Password" (Enable)
5. לחץ "Save"

## שלב 4: הגדרת Firestore Database

1. בתפריט השמאלי, לחץ על "Firestore Database"
2. לחץ "Create database"
3. בחר "Start in test mode" (לצורך פיתוח)
4. בחר location (למשל: us-central1)
5. לחץ "Enable"

## שלב 5: הגדרת Storage

1. בתפריט השמאלי, לחץ על "Storage"
2. לחץ "Get started"
3. בחר "Start in test mode" (לצורך פיתוח)
4. בחר location (להתאים ל-Firestore)
5. לחץ "Done"

## שלב 6: עדכון הקוד

1. פתח את `src/firebase/config.js`
2. החלף את הערכים ב-`firebaseConfig` עם הערכים מהשלב 2:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## שלב 7: הגדרת כללי אבטחה (Security Rules)

### Firestore Rules:
עדכן את הכללים ב-Firestore Console > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules:
עדכן את הכללים ב-Storage Console > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## הערות חשובות:

- **Test mode** הוא רק לפיתוח! לפני production צריך להגדיר כללי אבטחה מתאימים
- שמור את ה-config שלך בסוד - אל תעלה אותו ל-GitHub
- שקול להשתמש ב-environment variables עבור ה-config


