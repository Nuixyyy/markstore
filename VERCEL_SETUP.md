# إعداد Webhook على Vercel

## الخطوات:

### 1. رفع الملفات على GitHub

1. أنشئ repository جديد على GitHub
2. ارفع جميع الملفات:
   - `index.html`
   - `script.js`
   - `style.css`
   - `api/telegram-webhook.js` (المجلد api/ والملف بداخله)
   - `vercel.json`
   - `package.json`
   - `firestore.rules` (اختياري - للتوثيق)

### 2. ربط المشروع بـ Vercel

1. اذهب إلى [Vercel](https://vercel.com)
2. سجل دخول بحساب GitHub
3. اضغط على **Add New Project**
4. اختر repository الخاص بك
5. Vercel سيكتشف الإعدادات تلقائياً
6. اضغط **Deploy**

### 3. إعداد Webhook في تيليجرام

بعد النشر، ستحصل على URL مثل: `https://your-project.vercel.app`

قم بإعداد webhook:

```bash
curl -X POST "https://api.telegram.org/bot8205867201:AAHJ89--5boZu2qOZ4iLKzt6FCAd8MSOgnM/setWebhook?url=https://your-project.vercel.app/webhook"
```

**استبدل `your-project.vercel.app` بعنوان مشروعك على Vercel**

### 4. التحقق من Webhook

```bash
curl "https://api.telegram.org/bot8205867201:AAHJ89--5boZu2qOZ4iLKzt6FCAd8MSOgnM/getWebhookInfo"
```

يجب أن ترى:
- `url`: عنوان webhook الخاص بك
- `pending_update_count`: عدد التحديثات المعلقة

### 5. اختبار الوظيفة

1. قم بإنشاء طلب جديد من الموقع
2. ستصل رسالة في تيليجرام مع صور المنتجات
3. اضغط على زر "✅ مراجعة الطلب"
4. يجب أن تتحدث حالة الطلب في الموقع إلى "تم مراجعة طلبك وسيصلك الطلب خلال وقت محدد"

## هيكل الملفات المطلوب:

```
your-project/
├── api/
│   └── telegram-webhook.js    ← ملف webhook (يجب أن يكون في هذا المجلد)
├── index.html
├── script.js
├── style.css
├── vercel.json                ← إعدادات Vercel
└── package.json               ← التبعيات
```

## ⚠️ ملاحظة مهمة جداً:

**Firebase Admin SDK يتجاوز قواعد Firestore** - هذا يعني أن webhook يمكنه تحديث الطلبات حتى بدون إضافة service account في بعض الحالات.

لكن **للعمل بشكل موثوق**، يفضل إضافة Service Account Key في Vercel Environment Variables (راجع `VERCEL_ENV_SETUP.md`).

## ملاحظات مهمة:

1. **Vercel Functions**: الملفات في مجلد `api/` تصبح serverless functions تلقائياً
2. **URL**: الـ webhook سيكون على `/webhook` (بفضل rewrite في vercel.json)
3. **HTTPS**: Vercel يوفر HTTPS تلقائياً
4. **التحديثات**: عند رفع تحديثات على GitHub، Vercel سيعيد النشر تلقائياً

## استكشاف الأخطاء:

### إذا لم يعمل webhook:

1. **تحقق من logs في Vercel**:
   - اذهب إلى **Deployments** → اختر آخر deployment → **Functions** tab
   - ابحث عن `/api/telegram-webhook` وتحقق من الأخطاء

2. **تحقق من webhook URL**:
   ```bash
   curl "https://api.telegram.org/bot8205867201:AAHJ89--5boZu2qOZ4iLKzt6FCAd8MSOgnM/getWebhookInfo"
   ```
   يجب أن يظهر URL الخاص بك

3. **إذا ظهرت أخطاء Firebase**:
   - أضف Service Account Key في Vercel Environment Variables (راجع `VERCEL_ENV_SETUP.md`)
   - أو تأكد من أن Firebase Rules محدثة

### إذا ظهرت أخطاء "Module not found":

- تأكد من أن `package.json` يحتوي على `firebase-admin`
- Vercel سيقوم بتثبيت التبعيات تلقائياً عند النشر

## بديل: استخدام Vercel CLI محلياً

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# ربط المشروع
vercel link

# النشر
vercel --prod
```

