# إعداد Environment Variables في Vercel

## ⚠️ مهم جداً:

**Firebase Admin SDK يتجاوز قواعد Firestore** - هذا يعني أن webhook يمكنه تحديث الطلبات حتى بدون إضافة service account.

لكن **الأفضل** هو إضافة service account للحصول على صلاحيات كاملة.

## الطريقة الأولى: استخدام Firebase Admin SDK مع Service Account (موصى به)

### 1. الحصول على Service Account Key من Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. اذهب إلى **Project Settings** (⚙️) → **Service Accounts**
4. اضغط على **Generate New Private Key**
5. احفظ الملف (سيحتوي على JSON)

### 2. إضافة Service Account في Vercel

1. اذهب إلى مشروعك على Vercel
2. اذهب إلى **Settings** → **Environment Variables**
3. أضف متغير جديد:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: الصق محتوى ملف JSON كاملاً (انسخ كل المحتوى)
   - **Environment**: Production, Preview, Development (اختر الكل)

### 3. إعادة النشر

بعد إضافة Environment Variables، Vercel سيعيد النشر تلقائياً.

## الطريقة الثانية: استخدام Default Credentials (أبسط)

إذا كان مشروعك مربوط بـ Vercel و Firebase في نفس الحساب، يمكنك استخدام default credentials بدون service account.

في هذه الحالة، لا حاجة لإضافة environment variables.

## التحقق من الإعداد

بعد النشر، تحقق من logs في Vercel:
1. اذهب إلى **Deployments**
2. اختر آخر deployment
3. اضغط على **Functions** tab
4. تحقق من أن `/api/telegram-webhook` يعمل بدون أخطاء

## ملاحظات:

- **الأمان**: Service Account Key حساس - لا تشاركه أبداً
- **التحديثات**: عند تغيير Environment Variables، يجب إعادة النشر
- **الاختبار**: استخدم Vercel CLI للاختبار محلياً: `vercel dev`

