// Vercel Serverless Function for Telegram Webhook
// هذا الملف يجب أن يكون في مجلد api/ ليعمل على Vercel

import admin from 'firebase-admin';

// Initialize Firebase Admin
let db = null;
const initFirebase = () => {
    if (!db) {
        // إذا كان serviceAccount موجود في environment variables
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                if (!admin.apps.length) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                }
            } catch (e) {
                console.error('Error parsing service account:', e);
            }
        } else {
            // استخدام default credentials (إذا كان المشروع مربوط بـ Vercel)
            if (!admin.apps.length) {
                try {
                    admin.initializeApp({
                        projectId: 'webb-862b1'
                    });
                } catch (e) {
                    console.error('Error initializing Firebase:', e);
                }
            }
        }
        db = admin.firestore();
    }
    return db;
};

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = '8205867201:AAHJ89--5boZu2qOZ4iLKzt6FCAd8MSOgnM';
const TELEGRAM_CHAT_ID = '7348531151';

// Vercel Serverless Function
export default async function handler(req, res) {
    // السماح فقط بـ POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        
        // معالجة callback_query
        if (update.callback_query) {
            const callbackQuery = update.callback_query;
            const callbackData = callbackQuery.data;
            
            if (callbackData && callbackData.startsWith('rev_')) {
                // تهيئة Firebase Admin
                const firestoreDb = initFirebase();
                
                // إظهار loading
                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        callback_query_id: callbackQuery.id,
                        text: 'جاري مراجعة الطلب...'
                    })
                });
                
                // البحث عن الطلب
                const usersSnapshot = await firestoreDb.collection('users').get();
                
                let orderFound = false;
                for (const userDoc of usersSnapshot.docs) {
                    const userUid = userDoc.id;
                    const ordersSnapshot = await firestoreDb.collection(`users/${userUid}/orders`).get();
                    
                    for (const orderDoc of ordersSnapshot.docs) {
                        const orderData = orderDoc.data();
                        if (orderData.callbackData === callbackData) {
                            // تحديث حالة الطلب
                            const orderDocId = orderDoc.id;
                            await firestoreDb.collection(`users/${userUid}/orders`).doc(orderDocId).update({
                                status: 'reviewed',
                                updatedAt: new Date().toISOString()
                            });
                            
                            // تحديث رسالة تيليجرام
                            const message = callbackQuery.message;
                            const originalText = message.text || '';
                            const updatedText = originalText + '\n\n✅ *تم مراجعة طلبك وسيصلك الطلب خلال وقت محدد*';
                            
                            try {
                                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        chat_id: message.chat.id,
                                        message_id: message.message_id,
                                        text: updatedText,
                                        parse_mode: 'Markdown',
                                        reply_markup: {
                                            inline_keyboard: [[
                                                {
                                                    text: '✅ تم المراجعة',
                                                    callback_data: callbackData
                                                }
                                            ]]
                                        }
                                    })
                                });
                            } catch (editError) {
                                console.error('Error editing message:', editError);
                                // إذا فشل التعديل، أرسل رسالة جديدة
                                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        chat_id: message.chat.id,
                                        text: updatedText,
                                        parse_mode: 'Markdown',
                                        reply_to_message_id: message.message_id
                                    })
                                });
                            }
                            
                            // إرسال رسالة تأكيد
                            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    chat_id: message.chat.id,
                                    text: `✅ تم مراجعة الطلب ${orderData.orderId} بنجاح!\n\n✅ تم تحديث حالة الطلب في الموقع إلى: *تم مراجعة طلبك وسيصلك الطلب خلال وقت محدد*`,
                                    parse_mode: 'Markdown'
                                })
                            });
                            
                            orderFound = true;
                            break;
                        }
                    }
                    if (orderFound) break;
                }
                
                if (!orderFound) {
                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            callback_query_id: callbackQuery.id,
                            text: '❌ لم يتم العثور على الطلب',
                            show_alert: true
                        })
                    });
                }
            }
        }
        
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
