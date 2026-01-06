// Telegram Webhook Server
// هذا الملف يحتاج إلى تشغيله على server (Node.js)
// يمكنك استخدام services مثل Heroku, Railway, أو أي Node.js hosting

const express = require('express');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDocs, collection, updateDoc } = require('firebase/firestore');

const app = express();
app.use(express.json());

// Firebase Configuration (استخدم نفس الإعدادات من script.js)
const firebaseConfig = {
    apiKey: "AIzaSyAUmJV0geKhi4cO3coN-Rnhw5m0LrAWI9Y",
    authDomain: "webb-862b1.firebaseapp.com",
    projectId: "webb-862b1",
    storageBucket: "webb-862b1.firebasestorage.app",
    messagingSenderId: "929452543975",
    appId: "1:929452543975:web:238d0f3677da736fdf7742",
    measurementId: "G-6P0KVWZGTC"
};

// Initialize Firebase
const app_firebase = initializeApp(firebaseConfig);
const db = getFirestore(app_firebase);

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = '8205867201:AAHJ89--5boZu2qOZ4iLKzt6FCAd8MSOgnM';
const TELEGRAM_CHAT_ID = '7348531151';

// Webhook endpoint لمعالجة callback من تيليجرام
app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        
        // معالجة callback_query
        if (update.callback_query) {
            const callbackQuery = update.callback_query;
            const callbackData = callbackQuery.data;
            
            if (callbackData && callbackData.startsWith('rev_')) {
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
                const usersColRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersColRef);
                
                let orderFound = false;
                for (const userDoc of usersSnapshot.docs) {
                    const userUid = userDoc.id;
                    const ordersRef = collection(db, `users/${userUid}/orders`);
                    const ordersSnapshot = await getDocs(ordersRef);
                    
                    for (const orderDoc of ordersSnapshot.docs) {
                        const orderData = orderDoc.data();
                        if (orderData.callbackData === callbackData) {
                            // تحديث حالة الطلب
                            const orderDocId = orderDoc.id;
                            const orderRef = doc(db, `users/${userUid}/orders`, orderDocId);
                            await updateDoc(orderRef, {
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
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error');
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Telegram Webhook Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});

