# إعداد Telegram Webhook

## المشكلة:
عند الضغط على زر "مراجعة الطلب" في رسالة تيليجرام، البوت يبقى يحمل بدون تحديث حالة الطلب في الموقع.

## الحل:
نحتاج إلى إعداد webhook server لمعالجة callback من تيليجرام.

## الخطوات السريعة:

### الطريقة الأسهل: استخدام Render.com (مجاني)

1. **إنشاء حساب على Render**: https://render.com
2. **إنشاء Web Service جديد**:
   - اختر "New" → "Web Service"
   - اربط GitHub repository أو ارفع الملفات
   - Build Command: `npm install`
   - Start Command: `node telegram-webhook.js`
3. **انسخ عنوان URL** الذي يعطيه Render (مثل: `https://your-app.onrender.com`)

### إعداد Webhook في تيليجرام

بعد الحصول على عنوان URL، قم بإعداد webhook:

```bash
curl -X POST "https://api.telegram.org/bot8205867201:AAHJ89--5boZu2qOZ4iLKzt6FCAd8MSOgnM/setWebhook?url=https://YOUR-APP-URL.onrender.com/webhook"
```

استبدل `YOUR-APP-URL.onrender.com` بعنوان السيرفر الخاص بك.

### التحقق من Webhook

```bash
curl "https://api.telegram.org/bot8205867201:AAHJ89--5boZu2qOZ4iLKzt6FCAd8MSOgnM/getWebhookInfo"
```

## الملفات المطلوبة:

1. `telegram-webhook.js` - السيرفر
2. `package.json` - ملف التبعيات

## ملاحظات مهمة:

1. **HTTPS**: تيليجرام يتطلب HTTPS للـ webhook (Render يوفر HTTPS تلقائياً)
2. **Firebase Rules**: تأكد من أن القواعد تسمح بالوصول إلى الطلبات
3. **الاختبار**: بعد الإعداد، جرب الضغط على زر "مراجعة الطلب" في رسالة تيليجرام

## بديل سريع (بدون server):

إذا لم تستطع إعداد server، يمكنك استخدام:
- **Zapier**: https://zapier.com (مجاني لحد معين)
- **Make.com**: https://www.make.com (مجاني لحد معين)
- **n8n**: https://n8n.io (مفتوح المصدر)

هذه الخدمات تسمح بإنشاء webhook بدون كتابة كود.

