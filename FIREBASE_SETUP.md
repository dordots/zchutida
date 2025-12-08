# Firebase Setup - Storage Rules

## בעיית העלאת קבצים - פתרון

הבעיה היא שצריך לעדכן את כללי האבטחה של Firebase Storage.

### שלב 1: עדכון כללי Storage

1. לך ל-[Firebase Console](https://console.firebase.google.com/)
2. בחר את הפרויקט `zchutyeda`
3. בתפריט השמאלי, לחץ על **Storage**
4. לחץ על הטאב **Rules**
5. החלף את הכללים בכללים הבאים:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to all files for development
    // ⚠️ WARNING: This is for development only!
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

6. לחץ **Publish**

### שלב 2: בדיקת CORS (אם עדיין יש בעיה)

אם עדיין יש שגיאת CORS, צריך להוסיף CORS configuration:

1. התקן את Google Cloud SDK (אם עדיין לא מותקן)
2. הרץ את הפקודה הבאה:

```bash
gsutil cors set cors.json gs://zchutyeda.firebasestorage.app
```

כאשר `cors.json` הוא:

```json
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

### שלב 3: בדיקת Storage Bucket

1. ודא ש-Storage מופעל ב-Firebase Console
2. ודא שה-storageBucket ב-config נכון: `zchutyeda.firebasestorage.app`

## הערות חשובות:

- **Test mode** הוא רק לפיתוח! לפני production צריך להגדיר כללי אבטחה מתאימים
- אם אתה משתמש ב-Authentication בעתיד, עדכן את הכללים בהתאם



