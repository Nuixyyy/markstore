
import { initializeApp as initializeFirebaseApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, query, onSnapshot, deleteDoc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


const MY_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAUmJV0geKhi4cO3coN-Rnhw5m0LrAWI9Y",
    authDomain: "webb-862b1.firebaseapp.com",
    projectId: "webb-862b1",
    storageBucket: "webb-862b1.firebasestorage.app",
    messagingSenderId: "929452543975",
    appId: "1:929452543975:web:238d0f3677da736fdf7742",
    measurementId: "G-6P0KVWZGTC"
};


const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1471608631723032669/ZoYf8HzfP0s7DPPrxOWd5NRE48O9AxJ3w-rl7rA81mM82jV2noNkhSyl2d0R_M-EVMGD';


const sendDiscordWebhook = async (content, embeds = []) => {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content,
                embeds: embeds
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Discord Webhook Error:', errorText);
            throw new Error(`Failed to send webhook: ${response.status} ${response.statusText}`);
        }

        return response;
    } catch (error) {
        console.error('Error sending Discord webhook:', error);
        throw error;
    }
};


const IMGBB_API_KEY = '2111a1edb12a32e521b454d9fbba6985';


const getProxiedImageUrl = (url) => {
    if (!url) return url;

    if (url.includes('i.ibb.co')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
};


const generateProductSKU = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let sku = '';
    for (let i = 0; i < 6; i++) {
        sku += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sku;
};


const handleDeepLinking = () => {
    const hash = window.location.hash;
    if (!hash) return;

    if (hash.startsWith('#product-')) {
        const sku = hash.replace('#product-', '');
        const product = productsData.find(p => p.sku === sku);
        if (product) {
            openProductDetailPage(product);
        }
    } else if (hash.startsWith('#category-')) {
        const categoryName = decodeURIComponent(hash.replace('#category-', ''));
        const category = categoriesData.find(cat => cat.name === categoryName);
        if (category) {
            filterProductsByCategory(category.id);

            const productsSection = document.getElementById('products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
};


const migrateMissingSKUs = async () => {
    if (!isAdmin || productsData.length === 0) return;

    const productsToUpdate = productsData.filter(p => !p.sku);
    if (productsToUpdate.length === 0) return;

    console.log(`Migrating ${productsToUpdate.length} products to add SKUs...`);


    for (const product of productsToUpdate) {
        try {
            const productRef = doc(db, 'products', product.id);
            await updateDoc(productRef, {
                sku: generateProductSKU()
            });
            console.log(`SKU generated for product: ${product.name}`);
        } catch (err) {
            console.error(`Failed to update SKU for product ${product.id}:`, err);
        }
    }
};


window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alertUserMessage('تم نسخ الكود بنجاح!', 'success');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};


const MAIN_DEVELOPER_UID = 'KHX3gWqMtMQbl0PzumCSMfkSBAm1';


let developerUIDs = [MAIN_DEVELOPER_UID];


const iraqiGovernorates = [
    "بغداد", "البصرة", "الأنبار", "بابل", "ذي قار", "ديالى", "دهوك", "أربيل", "كربلاء",
    "كركوك", "ميسان", "المثنى", "النجف", "نينوى", "القادسية", "صلاح الدين", "السليمانية", "واسط"
];

let app;
let auth;
let db;
let userId = null;
let isAdmin = false;
let firebaseInitialized = false;
let currentUserProfile = null;

let productsData = [];
let categoriesData = [];
let reviewsData = [];
let currentCart = [];
let orderCartData = [];
let featuredProductsData = [];
let selectedFeaturedProducts = [];

let firebaseReadyPromise;
let resolveFirebaseReady;

firebaseReadyPromise = new Promise(resolve => {
    resolveFirebaseReady = resolve;
});

let uiElements = {};


const getUiElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`UI Element with ID '${id}' not found in the DOM.`);
        return null;
    }
    return element;
};


let resolveMessageBoxPromise;

const alertUserMessage = (message, type = 'info') => {
    if (!uiElements.messageBox) {
        console.error("Message box container element not found. Cannot display message.");
        return;
    }
    const msgBoxText = uiElements.messageBoxText;
    const msgBoxConfirmBtn = uiElements.messageBoxConfirmBtn;
    const msgBoxCancelBtn = uiElements.messageBoxCancelBtn;

    if (msgBoxText) msgBoxText.textContent = message;
    if (msgBoxConfirmBtn) msgBoxConfirmBtn.classList.add('hidden');
    if (msgBoxCancelBtn) msgBoxCancelBtn.classList.add('hidden');

    if (uiElements.messageBox) {

        uiElements.messageBox.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'bg-yellow-100');
        uiElements.messageBox.classList.add('bg-white');

        if (msgBoxText) {
            msgBoxText.classList.remove('text-green-800', 'text-red-800', 'text-blue-800', 'text-yellow-800', 'text-white');

            if (type === 'success') {
                msgBoxText.classList.add('text-green-800');
            } else if (type === 'error') {
                msgBoxText.classList.add('text-red-800');
            } else if (type === 'warning') {
                msgBoxText.classList.add('text-yellow-800');
            } else {
                msgBoxText.classList.add('text-blue-800');
            }
        }
    }

    if (uiElements.messageBox.timeoutId) {
        clearTimeout(uiElements.messageBox.timeoutId);
    }
    uiElements.messageBox.timeoutId = setTimeout(() => {
        if (uiElements.messageBox) uiElements.messageBox.classList.add('hidden');
    }, 3000);
};

const showConfirmationMessage = (message) => {
    if (!uiElements.messageBox) {
        console.error("Message box container element not found. Cannot display confirmation.");
        return Promise.resolve(false);
    }
    const msgBoxText = uiElements.messageBoxText;
    const msgBoxConfirmBtn = uiElements.messageBoxConfirmBtn;
    const msgBoxCancelBtn = uiElements.messageBoxCancelBtn;
    const overlay = document.getElementById('message-box-overlay');

    return new Promise(resolve => {
        if (msgBoxText) msgBoxText.textContent = message;
        if (msgBoxConfirmBtn) msgBoxConfirmBtn.classList.remove('hidden');
        if (msgBoxCancelBtn) msgBoxCancelBtn.classList.remove('hidden');


        if (overlay) overlay.classList.remove('hidden');

        if (uiElements.messageBox) {
            uiElements.messageBox.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'bg-yellow-100');
            if (msgBoxText) msgBoxText.classList.remove('text-green-800', 'text-red-800', 'text-blue-800', 'text-yellow-800');
        }

        if (uiElements.messageBox.timeoutId) {
            clearTimeout(uiElements.messageBox.timeoutId);
            uiElements.messageBox.timeoutId = null;
        }

        resolveMessageBoxPromise = resolve;
    });
};


const initializeFirebase = async () => {
    try {
        if (!MY_FIREBASE_CONFIG || !MY_FIREBASE_CONFIG.apiKey || MY_FIREBASE_CONFIG.apiKey === "YOUR_FALLBACK_API_KEY") {
            console.error("Custom Firebase config is missing or incomplete. Please update MY_FIREBASE_CONFIG with your project details.");
            alertUserMessage("خطأ: إعدادات Firebase الخاصة بك مفقودة أو غير مكتملة. الرجاء تحديثها في الكود.", 'error');
            if (resolveFirebaseReady) resolveFirebaseReady(false);
            return;
        }

        app = initializeFirebaseApp(MY_FIREBASE_CONFIG);

        if (!app) {
            console.error("Firebase app object is undefined after initialization. Check config or Firebase SDK loading.");
            alertUserMessage("فشل تهيئة تطبيق Firebase بشكل صحيح. الرجاء مراجعة الإعدادات.", 'error');
            if (resolveFirebaseReady) resolveFirebaseReady(false);
            return;
        }

        auth = getAuth(app);
        db = getFirestore(app);

        firebaseInitialized = true;
        console.log("Firebase services (app, auth, db) initialized with custom config.");

        if (!auth.currentUser) {
            await signInAnonymously(auth);
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                console.log("Authenticated with UID:", userId);
                await fetchUserProfile(userId);
                await fetchAdminStatus();
                setupRealtimeListeners();
            } else {
                userId = null;
                isAdmin = false;
                currentUserProfile = null;
                console.log("User logged out or not authenticated.");
                updateUIForLoggedOutUser();
            }
            if (firebaseReadyPromise && !firebaseReadyPromise._isResolved) {
                if (resolveFirebaseReady) resolveFirebaseReady(true);
                firebaseReadyPromise._isResolved = true;
            }
        });

        setTimeout(() => {
            if (firebaseReadyPromise && !firebaseReadyPromise._isResolved) {
                console.warn("FirebaseReadyPromise not resolved by onAuthStateChanged within timeout. Resolving as true as fallback.");
                if (resolveFirebaseReady) resolveFirebaseReady(true);
                firebaseReadyPromise._isResolved = true;
            }
        }, 5000);

    } catch (error) {
        console.error("Error initializing Firebase (outer catch):", error);
        alertUserMessage(`خطأ فادح أثناء تهيئة Firebase: ${error.message}. تأكد من أن إعداداتك صحيحة وأن Firebase مُمكّن.`, 'error');
        if (resolveFirebaseReady) resolveFirebaseReady(false);
    }
};


let cartUnsubscribe = null;
let ordersUnsubscribe = null;

const setupRealtimeListeners = () => {
    if (!db || !userId) {
        console.warn("Firestore or userId not available for setting up listeners.");
        return;
    }

    console.log("Setting up real-time listeners for products, categories, reviews, and cart...");


    if (cartUnsubscribe) {
        cartUnsubscribe();
        cartUnsubscribe = null;
    }
    if (ordersUnsubscribe) {
        ordersUnsubscribe();
        ordersUnsubscribe = null;
    }

    const productsColRef = collection(db, `products`);
    onSnapshot(productsColRef, (snapshot) => {
        productsData = [];
        snapshot.forEach((doc) => {
            productsData.push({ id: doc.id, ...doc.data() });
        });
        console.log("Products data fetched:", productsData.length);
        displayProducts(productsData);

        handleDeepLinking();

        migrateMissingSKUs();
    }, (error) => {
        console.error("Error fetching products:", error);
        if (error.code === 'permission-denied') {
            if (uiElements.productsContainer) {
                uiElements.productsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">خطأ في الأذونات: لا يمكن عرض المنتجات. الرجاء التحقق من قواعد أمان Firestore.</p>';
            } else {
                console.error("productsContainer element not found when trying to display permission error.");
            }
            alertUserMessage("خطأ في عرض المنتجات: الأذونات غير كافية.", 'error');
        } else {
            if (uiElements.productsContainer) {
                uiElements.productsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">فشل تحميل المنتجات.</p>';
            } else {
                console.error("productsContainer element not found when trying to display generic error.");
            }
        }
    });

    const categoriesColRef = collection(db, `categories`);
    onSnapshot(categoriesColRef, (snapshot) => {
        categoriesData = [];
        snapshot.forEach((doc) => {
            categoriesData.push({ id: doc.id, ...doc.data() });
        });
        console.log("Categories data fetched:", categoriesData.length);
        populateCategoryDropdowns();
        // Re-display products to ensure category names are resolved correctly after categories load
        if (productsData.length > 0) {
            displayProducts(productsData);
            displayFeaturedProducts(); // Also refresh featured products
        }
    }, (error) => {
        console.error("Error fetching categories:", error);
    });

    const reviewsColRef = collection(db, `reviews`);
    onSnapshot(reviewsColRef, (snapshot) => {
        reviewsData = [];
        snapshot.forEach((doc) => {
            reviewsData.push({ id: doc.id, ...doc.data() });
        });
        console.log("Reviews data fetched:", reviewsData.length);
        displayReviews(reviewsData);

        updateAddReviewButton();
    }, (error) => {
        console.error("Error fetching reviews:", error);
    });

    const cartColRef = collection(db, `users/${userId}/cart`);
    cartUnsubscribe = onSnapshot(cartColRef, (snapshot) => {
        currentCart = [];
        snapshot.forEach((doc) => {
            currentCart.push({ id: doc.id, ...doc.data() });
        });
        console.log("Cart data fetched:", currentCart.length);
        displayCart();
    }, (error) => {
        console.error("Error fetching cart:", error);
        if (error.code === 'permission-denied') {
            if (userId && uiElements.cartItemsContainer) {
                uiElements.cartItemsContainer.innerHTML = '<p class="text-center text-red-500">خطأ في الأذونات: لا يمكن عرض سلة التسوق الخاصة بك.</p>';
            }
        } else {
            if (uiElements.cartItemsContainer) {
                uiElements.cartItemsContainer.innerHTML = '<p class="text-center text-red-500">فشل تحميل سلة التسوق.</p>';
            }
        }
    });


    const featuredColRef = collection(db, `featuredProducts`);
    onSnapshot(featuredColRef, (snapshot) => {
        featuredProductsData = [];
        snapshot.forEach((doc) => {
            featuredProductsData.push({ id: doc.id, ...doc.data() });
        });
        console.log("Featured products data fetched:", featuredProductsData.length);
        displayFeaturedProducts();
    }, (error) => {
        console.error("Error fetching featured products:", error);
        if (error.code === 'permission-denied') {
            console.warn("Permission denied for featured products. Make sure Firebase rules allow read access for all users.");
            featuredProductsData = [];
            displayFeaturedProducts();
        } else {
            console.error("Other error with featured products:", error);
            featuredProductsData = [];
            displayFeaturedProducts();
        }
    });
};


const fetchUserProfile = async (uid) => {
    try {

        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            currentUserProfile = userData;
            if (uiElements.profileDetailsName) uiElements.profileDetailsName.textContent = userData.fullName || 'مستخدم';
            if (uiElements.profileDetailsPhone) uiElements.profileDetailsPhone.textContent = userData.phoneNumber || 'N/A';
            if (uiElements.profileDetailsImage) uiElements.profileDetailsImage.src = userData.profilePicUrl || 'https://placehold.co/100x100/eeeeee/333333?text=User';

            if (userData.createdAt) {
                const date = new Date(userData.createdAt);
                if (uiElements.profileDetailsRegisteredDate) uiElements.profileDetailsRegisteredDate.textContent = `تاريخ التسجيل: ${date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })} في ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                if (uiElements.profileDetailsRegisteredDate) uiElements.profileDetailsRegisteredDate.textContent = 'تاريخ التسجيل: غير متوفر';
            }

            if (uiElements.loginProfileText) uiElements.loginProfileText.textContent = 'حسابي';
            if (uiElements.profileDetailsLogoutBtn) uiElements.profileDetailsLogoutBtn.classList.remove('hidden');
            if (uiElements.profileDetailsLoginBtn) uiElements.profileDetailsLoginBtn.classList.add('hidden');

        } else {
            currentUserProfile = null;
            if (uiElements.profileDetailsName) uiElements.profileDetailsName.textContent = 'مستخدم غير مسجل';
            if (uiElements.profileDetailsPhone) uiElements.profileDetailsPhone.textContent = 'الرجاء تسجيل الدخول';
            if (uiElements.profileDetailsRegisteredDate) uiElements.profileDetailsRegisteredDate.textContent = '';
            if (uiElements.profileDetailsImage) uiElements.profileDetailsImage.src = 'https://placehold.co/100x100/eeeeee/333333?text=User';
            if (uiElements.loginProfileText) uiElements.loginProfileText.textContent = 'تسجيل دخول';
            if (uiElements.profileDetailsLogoutBtn) uiElements.profileDetailsLogoutBtn.classList.add('hidden');
            if (uiElements.profileDetailsLoginBtn) uiElements.profileDetailsLoginBtn.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        alertUserMessage(`خطأ في جلب بيانات الملف الشخصي: ${error.message}`, 'error');
    }
};

const fetchAdminStatus = async () => {
    try {

        if (!userId || !auth || !auth.currentUser) {
            console.log("User not signed in, skipping admin status check.");
            isAdmin = false;
            if (uiElements.developerButtons) uiElements.developerButtons.classList.add('hidden');
            if (uiElements.developerStatus) uiElements.developerStatus.classList.add('hidden');
            return;
        }


        if (userId === MAIN_DEVELOPER_UID) {
            developerUIDs = [MAIN_DEVELOPER_UID];
            isAdmin = true;
            if (uiElements.developerButtons) uiElements.developerButtons.classList.remove('hidden');
            if (uiElements.developerStatus) uiElements.developerStatus.classList.remove('hidden');
            const manageDevelopersBtn = document.getElementById('manage-developers-btn');
            if (manageDevelopersBtn) manageDevelopersBtn.classList.remove('hidden');
            console.log("Current user is main developer.");
            return;
        }


        const developersDocRef = doc(db, `settings`, 'developers');
        const developersDocSnap = await getDoc(developersDocRef);

        if (developersDocSnap.exists()) {
            const developersData = developersDocSnap.data();
            developerUIDs = developersData.uids || [MAIN_DEVELOPER_UID];
        } else {

            await setDoc(developersDocRef, { uids: [MAIN_DEVELOPER_UID] });
            developerUIDs = [MAIN_DEVELOPER_UID];
        }


        if (developerUIDs.includes(userId)) {
            isAdmin = true;
            if (uiElements.developerButtons) uiElements.developerButtons.classList.remove('hidden');
            if (uiElements.developerStatus) uiElements.developerStatus.classList.remove('hidden');


            const manageFeaturedBtn = document.getElementById('manage-featured-btn');
            if (manageFeaturedBtn) {
                manageFeaturedBtn.classList.remove('hidden');
            }

            console.log("Current user is admin/developer.");


            const manageDevelopersBtn = document.getElementById('manage-developers-btn');
            if (manageDevelopersBtn) {
                if (userId === MAIN_DEVELOPER_UID) {
                    manageDevelopersBtn.classList.remove('hidden');
                } else {
                    manageDevelopersBtn.classList.add('hidden');
                }
            }


            setTimeout(() => {
                fetchAndDisplayUserCount();
            }, 2000);
        } else {
            isAdmin = false;
            if (uiElements.developerButtons) uiElements.developerButtons.classList.add('hidden');
            if (uiElements.developerStatus) uiElements.developerStatus.classList.add('hidden');


            const manageFeaturedBtn = document.getElementById('manage-featured-btn');
            if (manageFeaturedBtn) {
                manageFeaturedBtn.classList.add('hidden');
            }

            console.log("Current user is not admin/developer.");
        }
    }
    catch (error) {
        console.error("Error fetching admin status:", error);
    }
};


const displayFeaturedProducts = () => {
    const featuredContainer = document.getElementById('featured-products-container');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = '';

    if (featuredProductsData.length === 0) {
        featuredContainer.innerHTML = '<p class="text-center text-gray-500 w-full">لا توجد منتجات مميزة حالياً</p>';
        return;
    }

    featuredProductsData.forEach(featuredItem => {
        const product = productsData.find(p => p.id === featuredItem.productId);
        if (!product) return;

        const mainImageUrl = getProxiedImageUrl((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl);
        const displayPrice = product.discountPrice || product.price;
        const formattedPrice = Math.round(displayPrice).toLocaleString('en-US');

        let priceHtml = `<p>${formattedPrice} د.ع</p>`;
        let discountBadgeHtml = '';

        if (product.discountPrice) {
            const originalPriceFormatted = Math.round(product.price).toLocaleString('en-US');
            const discountPercentage = Math.round(((product.price - product.discountPrice) / product.price) * 100);

            priceHtml = `
                <div class="flex flex-col items-center">
                    <p class="text-xs line-through" style="color: red !important;">${originalPriceFormatted} د.ع</p>
                    <p class="text-green-600 font-bold">${formattedPrice} د.ع</p>
                </div>
            `;

            discountBadgeHtml = `
                <div class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg z-10 shadow-sm">
                    ${discountPercentage}% -
                </div>
            `;
        }

        let deleteBtnHtml = '';
        if (isAdmin) {
            deleteBtnHtml = `<button onclick="deleteFeaturedProductDirectly('${featuredItem.id}', event)" class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors z-20 shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>`;
        }

        const featuredCard = `
            <div class="featured-product-card relative group" data-product-id="${product.id}">
                ${discountBadgeHtml}
                ${deleteBtnHtml}
                <img src="${mainImageUrl || 'https://placehold.co/200x120/f8fafc/666666?text=Product'}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/200x120/f8fafc/666666?text=Product';">
                <h3>${product.name}</h3>
                ${priceHtml}
            </div>
        `;
        featuredContainer.insertAdjacentHTML('beforeend', featuredCard);
    });

    document.querySelectorAll('.featured-product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const productId = e.currentTarget.dataset.productId;
            const product = productsData.find(p => p.id === productId);
            if (product) {
                openProductDetailPage(product);
            }
        });
    });
};

window.deleteFeaturedProductDirectly = async (featuredDocId, event) => {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    if (!isAdmin) return;

    const confirmed = await showConfirmationMessage("هل أنت متأكد من حذف هذا المنتج من المميزة؟");
    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, 'featuredProducts', featuredDocId));
        alertUserMessage("تم حذف المنتج من المميزة بنجاح", "success");
    } catch (error) {
        console.error("Error removing featured product:", error);
        alertUserMessage("فشل الحذف", "error");
    }
};

const openManageFeaturedModal = () => {
    if (!isAdmin) return;

    const modal = document.getElementById('manage-featured-modal');
    if (!modal) return;


    selectedFeaturedProducts = [...featuredProductsData.map(f => f.productId)];

    displayCurrentFeaturedProducts();
    displayAvailableProducts();

    modal.classList.remove('hidden');
};

const displayCurrentFeaturedProducts = () => {
    const container = document.getElementById('current-featured-list');
    if (!container) return;

    container.innerHTML = '';

    if (selectedFeaturedProducts.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-300">لا توجد منتجات مميزة</p>';
        return;
    }

    selectedFeaturedProducts.forEach(productId => {
        const product = productsData.find(p => p.id === productId);
        if (!product) return;

        const mainImageUrl = getProxiedImageUrl((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl);

        const productCard = `
            <div class="bg-purple-700 p-3 rounded-lg relative">
                <button class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700" onclick="removeFeaturedProduct('${productId}')">×</button>
                <img src="${mainImageUrl}" alt="${product.name}" class="w-full h-20 object-contain bg-white rounded mb-2">
                <h4 class="text-white text-sm font-medium truncate">${product.name}</h4>
                <p class="text-green-300 text-xs">${Math.round(product.price).toLocaleString('en-US')} د.ع</p>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', productCard);
    });
};

const displayAvailableProducts = (searchTerm = '') => {
    const container = document.getElementById('available-products-list');
    if (!container) return;

    container.innerHTML = '';


    let availableProducts = productsData.filter(product =>
        !selectedFeaturedProducts.includes(product.id) &&
        product.availability !== 'sold' &&
        (searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (availableProducts.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-300">لا توجد منتجات متاحة</p>';
        return;
    }

    availableProducts.forEach(product => {
        const mainImageUrl = getProxiedImageUrl((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl);

        const productCard = `
            <div class="bg-purple-700 p-3 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors" onclick="addFeaturedProduct('${product.id}')">
                <img src="${mainImageUrl}" alt="${product.name}" class="w-full h-20 object-contain bg-white rounded mb-2">
                <h4 class="text-white text-sm font-medium truncate">${product.name}</h4>
                <p class="text-green-300 text-xs">${Math.round(product.price).toLocaleString('en-US')} د.ع</p>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', productCard);
    });
};

window.addFeaturedProduct = (productId) => {
    if (!selectedFeaturedProducts.includes(productId)) {
        selectedFeaturedProducts.push(productId);
        displayCurrentFeaturedProducts();
        displayAvailableProducts(document.getElementById('featured-search-input')?.value || '');
    }
};

window.removeFeaturedProduct = (productId) => {
    selectedFeaturedProducts = selectedFeaturedProducts.filter(id => id !== productId);
    displayCurrentFeaturedProducts();
    displayAvailableProducts(document.getElementById('featured-search-input')?.value || '');
};

const saveFeaturedProducts = async () => {
    if (!isAdmin) {
        alertUserMessage("ليس لديك صلاحية لإدارة المنتجات المميزة.", 'error');
        return;
    }

    try {
        console.log("Saving featured products:", selectedFeaturedProducts);


        const featuredColRef = collection(db, 'featuredProducts');
        const existingSnapshot = await getDocs(featuredColRef);

        console.log("Existing featured products to delete:", existingSnapshot.docs.length);


        for (const docToDelete of existingSnapshot.docs) {
            try {
                await deleteDoc(docToDelete.ref);
                console.log("Deleted featured product:", docToDelete.id);
            } catch (deleteError) {
                console.error("Error deleting featured product:", docToDelete.id, deleteError);
            }
        }


        let successCount = 0;
        for (const productId of selectedFeaturedProducts) {
            try {
                const docRef = await addDoc(featuredColRef, {
                    productId: productId,
                    createdAt: new Date().toISOString(),
                    addedBy: userId
                });
                console.log("Added featured product:", productId, "with ID:", docRef.id);
                successCount++;
            } catch (addError) {
                console.error("Error adding featured product:", productId, addError);
            }
        }

        if (successCount > 0) {
            alertUserMessage(`تم حفظ ${successCount} منتج مميز بنجاح!`, 'success');
        } else if (selectedFeaturedProducts.length === 0) {
            alertUserMessage('تم إزالة جميع المنتجات المميزة بنجاح!', 'success');
        } else {
            alertUserMessage('فشل في حفظ المنتجات المميزة. تحقق من الأذونات.', 'error');
        }


        setTimeout(() => {
            const modal = document.getElementById('manage-featured-modal');
            if (modal) modal.classList.add('hidden');
        }, 1000);

    } catch (error) {
        console.error("Error saving featured products:", error);
        if (error.code === 'permission-denied') {
            alertUserMessage("خطأ في الأذونات: تأكد من أن قواعد Firebase تسمح للمطورين بإدارة المنتجات المميزة.", 'error');
        } else {
            alertUserMessage(`فشل حفظ المنتجات المميزة: ${error.message}`, 'error');
        }
    }
};


const findExistingUser = async (fullName, phoneNumber) => {
    try {
        console.log("Searching for existing user with:", { fullName, phoneNumber });


        const usersColRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersColRef);

        for (const userDoc of usersSnapshot.docs) {
            try {
                const userProfileRef = doc(db, 'users', userDoc.id);
                const userProfileSnap = await getDoc(userProfileRef);

                if (userProfileSnap.exists()) {
                    const userData = userProfileSnap.data();

                    if (userData.fullName === fullName && userData.phoneNumber === phoneNumber) {
                        console.log("Found existing user:", userDoc.id);
                        return {
                            userId: userDoc.id,
                            data: userData
                        };
                    }
                }
            } catch (profileError) {
                continue;
            }
        }

        return null;
    } catch (error) {
        console.error("Error searching for existing user:", error);
        return null;
    }
};


const checkPhoneExists = async (phoneNumber) => {
    try {
        const usersColRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersColRef);

        for (const userDoc of usersSnapshot.docs) {
            try {
                const userProfileRef = doc(db, 'users', userDoc.id);
                const userProfileSnap = await getDoc(userProfileRef);

                if (userProfileSnap.exists()) {
                    const userData = userProfileSnap.data();
                    if (userData.phoneNumber === phoneNumber) {
                        return true;
                    }
                }
            } catch (profileError) {
                continue;
            }
        }

        return false;
    } catch (error) {
        console.error("Error checking phone:", error);
        return false;
    }
};


const fetchAndDisplayUserCount = async () => {
    if (!isAdmin) return;

    try {
        const usersColRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersColRef);
        let userCount = 0;


        for (const userDoc of usersSnapshot.docs) {
            try {
                const userProfileRef = doc(db, 'users', userDoc.id);
                const userProfileSnapshot = await getDoc(userProfileRef);
                if (userProfileSnapshot.exists()) {
                    const userData = userProfileSnapshot.data();

                    if (userData.fullName && userData.phoneNumber) {
                        userCount++;
                    }
                }
            } catch (profileError) {

                continue;
            }
        }

        const userCountElement = document.getElementById('user-count');
        if (userCountElement) {
            userCountElement.textContent = userCount;
        }

    } catch (error) {
        console.error("Error fetching user count:", error);
        const userCountElement = document.getElementById('user-count');
        if (userCountElement) {
            userCountElement.textContent = '0';
        }
    }
};


const updateAddReviewButton = () => {

    if (!uiElements.addReviewBtn) {
        uiElements.addReviewBtn = document.getElementById('add-review-btn');
    }

    if (userId && currentUserProfile) {

        if (uiElements.addReviewBtn) {
            uiElements.addReviewBtn.disabled = false;
            uiElements.addReviewBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            uiElements.addReviewBtn.classList.add('cursor-pointer');
            uiElements.addReviewBtn.title = 'إضافة تقييم';
        }
    } else {

        if (uiElements.addReviewBtn) {
            uiElements.addReviewBtn.disabled = true;
            uiElements.addReviewBtn.classList.add('opacity-50', 'cursor-not-allowed');
            uiElements.addReviewBtn.classList.remove('cursor-pointer');
            uiElements.addReviewBtn.title = 'يرجى تسجيل الدخول أولاً';
        }
    }
};

const updateUIForLoggedOutUser = () => {
    isAdmin = false;
    currentUserProfile = null;
    if (uiElements.developerButtons) uiElements.developerButtons.classList.add('hidden');
    if (uiElements.developerStatus) uiElements.developerStatus.classList.add('hidden');
    if (uiElements.loginProfileText) uiElements.loginProfileText.textContent = 'تسجيل دخول';


    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) profileIcon.classList.add('hidden');

    if (uiElements.productsContainer) uiElements.productsContainer.innerHTML = '<p class="col-span-full text-center text-white">الرجاء تسجيل الدخول لعرض المنتجات.</p>';
    if (uiElements.cartItemsContainer) uiElements.cartItemsContainer.innerHTML = '<p class="text-center text-white">الرجاء تسجيل الدخول لعرض سلة التسوق.</p>';
    if (uiElements.headerCartCount) uiElements.headerCartCount.textContent = '0';
    if (uiElements.cartTotalElement) uiElements.cartTotalElement.textContent = '0.00 د.ع';
    if (uiElements.cartSummaryDiv) uiElements.cartSummaryDiv.classList.add('hidden');
    if (uiElements.checkoutButton) uiElements.checkoutButton.classList.add('hidden');

    if (uiElements.profileDetailsName) uiElements.profileDetailsName.textContent = 'مستخدم غير مسجل';
    if (uiElements.profileDetailsPhone) uiElements.profileDetailsPhone.textContent = 'الرجاء تسجيل الدخول';
    if (uiElements.profileDetailsRegisteredDate) uiElements.profileDetailsRegisteredDate.textContent = '';
    if (uiElements.profileDetailsImage) uiElements.profileDetailsImage.src = 'https://placehold.co/100x100/eeeeee/333333?text=User';
    if (uiElements.profileDetailsLogoutBtn) uiElements.profileDetailsLogoutBtn.classList.add('hidden');
    if (uiElements.profileDetailsLoginBtn) uiElements.profileDetailsLoginBtn.classList.remove('hidden');

    currentCart = [];


    updateAddReviewButton();
};


const displayProducts = (products) => {
    console.log("displayProducts: productsData received:", products);


    if (!uiElements.productsContainer) {
        uiElements.productsContainer = document.getElementById('products-container');
        console.log("Re-fetching productsContainer:", uiElements.productsContainer);
    }


    if (!uiElements.productsContainer) {
        console.error("Error: productsContainer element not found when trying to display products.");
        console.log("Available elements with 'product' in ID:",
            Array.from(document.querySelectorAll('[id*="product"]')).map(el => el.id));
        return;
    }

    console.log("displayProducts: uiElements.productsContainer found successfully");

    uiElements.productsContainer.innerHTML = '';
    if (products.length === 0) {
        uiElements.productsContainer.innerHTML = '<p class="col-span-full text-center text-white">لا توجد منتجات لعرضها حاليًا.</p>';
        return;
    }


    const sortedProducts = [...products].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });
    sortedProducts.forEach(product => {
        const displayPrice = product.discountPrice || product.price;
        const formattedPrice = Math.round(displayPrice).toLocaleString('en-US');
        const oldPriceHtml = product.discountPrice ? `<span class="product-price-old">${Math.round(product.price).toLocaleString('en-US')} د.ع</span>` : '';

        const mainImageUrl = getProxiedImageUrl((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl);


        const freeDeliveryText = product.freeDelivery ? '<p class="text-green-400 text-sm mt-1 font-semibold">توصيل مجاني</p>' : '';


        let availabilityText = '';
        let buttonsSection = '';

        if (product.availability === 'available') {
            availabilityText = '<p class="text-green-400 text-sm mt-1 font-semibold">متوفر</p>';
        } else if (product.availability === 'sold') {
            availabilityText = '<p class="text-red-400 text-sm mt-1 font-semibold">مباع</p>';
        }


        if (product.availability !== 'sold') {
            buttonsSection = `
                <div class="space-y-2 mt-3">
                    <button data-product-id="${product.id}" class="add-to-cart-btn w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-md">
                        أضف إلى السلة
                    </button>
                    <button data-product-id="${product.id}" class="buy-now-card-btn w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition duration-300 shadow-md">
                        شراء الآن
                    </button>
                </div>
            `;
        }

        const removeWhiteBgClass = product.removeWhiteBackground ? ' remove-white-bg' : '';

        // Generate color circles HTML
        const colorCirclesHtml = product.colors && product.colors.length > 0 ? `
            <div class="absolute top-2 left-2 flex gap-1 z-10">
                ${window.displayProductColors(product.colors)}
            </div>
        ` : '';

        const productCard = `
            <div id="product-${product.id}" class="bg-purple-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl product-card-hover border border-purple-700${removeWhiteBgClass} relative">
                ${colorCirclesHtml}
                <img src="${mainImageUrl || 'https://placehold.co/600x400/1a012a/ffffff?text=Product'}" alt="${product.name}" class="w-full h-64 object-contain bg-transparent rounded-t-lg" onerror="this.onerror=null;this.src='https://placehold.co/600x400/1a012a/ffffff?text=Product';" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">
                <div class="p-4 text-right">
                    <h3 class="text-xl font-semibold text-white truncate">${product.name}</h3>
                    <p class="text-gray-600 text-sm mt-1">القسم: ${categoriesData.find(cat => cat.id === product.category)?.name || 'غير مصنف'}
                    </p>
                    <p class="text-gray-500 text-xs mt-1">اضغط على المنتج لمعرفة التفاصيل</p>
                    ${freeDeliveryText}
                    ${availabilityText}
                    <p class="text-lg font-bold mt-2 text-center">
                        <span class="product-price-new">${formattedPrice} د.ع</span>
                        ${oldPriceHtml}
                    </p>
                    ${buttonsSection}
                    ${isAdmin ? `
                    <div class="flex gap-2 mt-3">
                        <button data-product-id="${product.id}" class="edit-single-product-btn w-1/2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md">
                            تعديل
                        </button>
                        <button data-product-id="${product.id}" class="delete-single-product-btn w-1/2 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-300 shadow-md">
                            حذف
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        uiElements.productsContainer.insertAdjacentHTML('beforeend', productCard);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = e.target.dataset.productId;
            const productToAdd = productsData.find(p => p.id === productId);
            if (productToAdd && userId) {
                await addToCart(productToAdd);
            } else if (!userId) {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإضافة منتجات إلى السلة.");
            }
        });
    });

    document.querySelectorAll('.buy-now-card-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();

            if (!userId || !currentUserProfile) {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإتمام عملية الشراء.", 'warning');
                return;
            }

            const productId = e.target.dataset.productId;
            const productToBuy = productsData.find(p => p.id === productId);

            if (productToBuy) {

                const tempCart = [{
                    id: productToBuy.id,
                    productId: productToBuy.id,
                    name: productToBuy.name,
                    price: productToBuy.discountPrice || productToBuy.price,
                    imageUrl: (productToBuy.imageUrls && productToBuy.imageUrls.length > 0) ? productToBuy.imageUrls[0] : productToBuy.imageUrl,
                    quantity: 1
                }];


                orderCartData = [...tempCart];


                populateCheckoutModalDirectPurchase(productToBuy);


                if (uiElements.checkoutModal) uiElements.checkoutModal.classList.remove('hidden');
            }
        });
    });

    document.querySelectorAll('.product-card-hover').forEach(card => {
        card.addEventListener('click', (e) => {
            const productId = e.currentTarget.id.replace('product-', '');
            const product = productsData.find(p => p.id === productId);
            if (product) {
                openProductDetailPage(product);
            }
        });
    });

    if (isAdmin) {
        document.querySelectorAll('.edit-single-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = e.target.dataset.productId;
                const productToEdit = productsData.find(p => p.id === productId);
                if (productToEdit) {
                    openEditProductModal(productToEdit);
                }
            });
        });
        document.querySelectorAll('.delete-single-product-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const productId = e.target.dataset.productId;
                await deleteProduct(productId);
            });
        });
    }
};


let productHistory = [];

const openProductDetailPage = (product) => {

    productHistory.push(product);


    if (product.sku) {
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = `product-${product.sku}`;
        window.history.pushState({ sku: product.sku }, '', currentUrl.href);
    }


    const mainContent = document.querySelector('main');
    const header = document.querySelector('header');
    const bottomNav = document.querySelector('nav');

    if (mainContent) mainContent.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';


    let productImages = [];
    if (product.imageUrls && product.imageUrls.length > 0) {
        productImages = product.imageUrls.map(url => getProxiedImageUrl(url));
    } else if (product.imageUrl) {
        productImages = [getProxiedImageUrl(product.imageUrl)];
    } else {
        productImages = ['https://placehold.co/600x400/1a012a/ffffff?text=لا توجد صورة'];
    }


    let statusInfo = '';
    if (product.availability === 'available') {
        statusInfo += '<span class="text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full text-sm">متوفر</span>';
    } else if (product.availability === 'sold') {
        statusInfo += '<span class="text-red-600 font-semibold bg-red-100 px-2 py-1 rounded-full text-sm">مباع</span>';
    }
    if (product.freeDelivery) {
        statusInfo += ' <span class="text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full text-sm mr-2">توصيل مجاني</span>';
    }


    const productSku = product.sku || 'N/A';
    statusInfo += `
        <div class="mt-4 flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-fit border border-gray-200">
            <span class="text-xs font-bold text-gray-500 uppercase">كود المنتج:</span>
            <span class="text-sm font-mono font-bold text-blue-700 select-all" id="sku-display">${productSku}</span>
            <button onclick="copyToClipboard('${productSku}')" class="p-1 hover:bg-gray-200 rounded-md transition-colors" title="نسخ الكود">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
            </button>
        </div>
    `;


    let buttonsSection = '';
    if (product.availability !== 'sold') {
        let adminButtons = '';
        if (isAdmin) {
            const isFeatured = featuredProductsData.some(f => f.productId === product.id);
            const btnText = isFeatured ? 'إزالة من المميزة' : 'إضافة للمميزة';
            const btnColor = isFeatured ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700';
            const btnIcon = isFeatured ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>';

            adminButtons = `
                <button id="admin-toggle-featured-btn" onclick="toggleFeaturedStatus('${product.id}')" class="w-full ${btnColor} text-white py-4 rounded-lg font-semibold transition duration-300 shadow-lg flex items-center justify-center gap-2 mb-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${btnIcon}
                    </svg>
                    <span id="admin-featured-btn-text">${btnText}</span>
                </button>
             `;
        }

        buttonsSection = `
            <div class="space-y-3 mb-6">
                ${adminButtons}
                <button id="product-page-share-btn" class="w-full bg-blue-500 text-white py-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 shadow-lg flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    مشاركة المنتج
                </button>
                <button id="product-page-add-to-cart" class="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-lg flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"></path>
                    </svg>
                    أضف إلى السلة
                </button>
                <button id="product-page-buy-now" class="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition duration-300 shadow-lg flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    شراء الآن
                </button>
            </div>
        `;
    }


    let thumbnailsHtml = '';
    productImages.forEach((imageUrl, index) => {
        thumbnailsHtml += `
            <div class="cursor-pointer border-2 ${index === 0 ? 'border-blue-500' : 'border-gray-300'} hover:border-blue-400 rounded-lg overflow-hidden transition duration-200 w-16 h-16" onclick="changeMainImage('${imageUrl}', ${index})">
                <img src="${imageUrl}" alt="${product.name} ${index + 1}" class="w-full h-full object-contain bg-white" onerror="this.onerror=null;this.src='https://placehold.co/60x60/1a012a/ffffff?text=${index + 1}';">
            </div>
        `;
    });


    const relatedProducts = productsData.filter(p =>
        p.id !== product.id &&
        p.availability !== 'sold' &&
        (p.category === product.category || p.name.toLowerCase().includes(product.name.toLowerCase().split(' ')[0]))
    ).slice(0, 4);

    let relatedProductsHtml = '';
    if (relatedProducts.length > 0) {
        relatedProductsHtml = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">منتجات ذات صلة</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${relatedProducts.map(relProduct => `
                        <div class="border rounded-lg p-3 cursor-pointer hover:shadow-md transition duration-300" onclick="openRelatedProduct('${relProduct.id}')">
                            <img src="${getProxiedImageUrl((relProduct.imageUrls && relProduct.imageUrls[0]) || relProduct.imageUrl)}" alt="${relProduct.name}" class="w-full h-20 object-contain mb-2 bg-gray-50 rounded">
                            <h4 class="text-sm font-medium text-gray-800 truncate">${relProduct.name}</h4>
                            <p class="text-sm font-bold text-green-600">
                                <span>${Math.round(relProduct.discountPrice || relProduct.price).toLocaleString('en-US')} د.ع</span>
                                ${relProduct.discountPrice ? `<span class="product-price-old text-xs">${Math.round(relProduct.price).toLocaleString('en-US')} د.ع</span>` : ''}
                            </p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }


    const productPageHtml = `
        <div id="product-detail-page" class="min-h-screen" style="background-color: #ffffff; color: #333333;">
            <!-- Header with back button - Fixed and Responsive -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-4 md:p-6 shadow-2xl fixed top-0 left-0 right-0 z-[9999]">
                <div class="flex items-center justify-between max-w-7xl mx-auto">
                    <button id="back-to-previous" class="bg-white text-blue-600 px-4 py-3 md:px-8 md:py-4 rounded-xl hover:bg-blue-50 hover:shadow-xl transition duration-300 flex items-center gap-2 md:gap-3 font-bold shadow-xl text-lg md:text-xl border-2 md:border-3 border-blue-300 transform hover:scale-105 active:scale-95">
                        <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        <span class="text-blue-700 text-sm md:text-base">رجوع</span>
                    </button>
                    <h1 class="text-lg md:text-2xl font-bold text-white text-center flex-1 mx-4">تفاصيل المنتج</h1>
                    <div class="w-16 md:w-32"></div>
                </div>
            </div>

            <!-- Content with padding for fixed header -->
            <div class="pt-24 md:pt-32 pb-8">
                <div class="container mx-auto px-4 max-w-7xl">
                    <!-- Main Product Image -->
                    <div class="mb-4">
                        <div class="relative bg-white rounded-lg shadow-lg p-4">
                            <img id="main-product-image" src="${productImages[0]}" alt="${product.name}" class="w-full h-80 object-contain rounded-lg cursor-zoom-in transition-transform duration-200 hover:scale-[1.02]">
                            <div class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs">
                                <span id="current-img-index">1</span> / <span>${productImages.length}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Thumbnails -->
                    <div class="flex justify-center gap-2 mb-6" id="product-thumbnails">
                        ${thumbnailsHtml}
                    </div>

                    <!-- Product Name and Category -->
                    <div class="bg-white p-4 rounded-lg shadow-lg mb-4">
                        <div class="flex flex-wrap items-center gap-3 mb-3">
                            <h2 class="text-2xl font-bold text-gray-800">${product.name}</h2>
                            <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${categoriesData.find(cat => cat.id === product.category)?.name || 'غير مصنف'}</span>
                        </div>

                        <!-- Status Info -->
                        <div class="mb-3">
                            ${statusInfo}
                        </div>

                        <!-- Price -->
                        <div>
                            <p class="text-3xl font-bold text-green-600">
                                <span class="product-price-new">${Math.round(product.discountPrice || product.price).toLocaleString('en-US')} د.ع</span>
                                ${product.discountPrice ? `<span class="product-price-old text-xl">${Math.round(product.price).toLocaleString('en-US')} د.ع</span>` : ''}
                            </p>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    ${buttonsSection}

                    <!-- Product Description -->
                    <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">وصف المنتج</h3>
                        <div class="text-gray-700 leading-relaxed whitespace-pre-line">${product.description}</div>
                    </div>

                    <!-- Related Products -->
                    ${relatedProductsHtml}
                </div>
            </div>
        </div>
    `;


    document.body.insertAdjacentHTML('beforeend', productPageHtml);


    const backToHome = () => {

        productHistory.pop();


        const currentUrl = new URL(window.location.href);
        currentUrl.hash = '';
        window.history.pushState({}, '', currentUrl.href);

        const productPage = document.getElementById('product-detail-page');
        if (productPage) productPage.remove();


        if (productHistory.length > 0) {
            const previousProduct = productHistory[productHistory.length - 1];
            productHistory.pop();
            openProductDetailPage(previousProduct);
        } else {

            if (mainContent) mainContent.style.display = 'block';
            if (bottomNav) bottomNav.style.display = 'block';
        }
    };

    const backButton = document.getElementById('back-to-previous');
    if (backButton) {
        backButton.addEventListener('click', backToHome);
    }

    const addToCartBtn = document.getElementById('product-page-add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            if (userId && currentUserProfile) {
                await addToCart(product);
            } else {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإضافة منتجات إلى السلة.");
            }
        });
    }

    const buyNowBtn = document.getElementById('product-page-buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', async () => {
            if (!userId || !currentUserProfile) {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإتمام عملية الشراء.", 'warning');
                return;
            }

            const mainImageUrl = productImages[0];
            const tempCart = [{
                id: product.id,
                productId: product.id,
                name: product.name,
                price: product.discountPrice || product.price,
                imageUrl: mainImageUrl,
                quantity: 1
            }];

            orderCartData = [...tempCart];
            populateCheckoutModalDirectPurchase(product);


            const productPage = document.getElementById('product-detail-page');
            if (productPage) productPage.remove();
            if (mainContent) mainContent.style.display = 'block';
            if (bottomNav) bottomNav.style.display = 'block';

            if (uiElements.checkoutModal) uiElements.checkoutModal.classList.remove('hidden');
        });
        const shareBtn = document.getElementById('product-page-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                copyProductLink(product);
            });
        }

        const mainImg = document.getElementById('main-product-image');
        if (mainImg) {
            mainImg.addEventListener('click', () => {
                // Get current index from the display
                const currentIndexSpan = document.getElementById('current-img-index');
                let currentIndex = 0;
                if (currentIndexSpan) currentIndex = parseInt(currentIndexSpan.textContent) - 1;
                if (isNaN(currentIndex)) currentIndex = 0;
                openLightbox(productImages, currentIndex);
            });
        }
    }


    window.changeMainImage = (imageUrl, index) => {
        const mainImage = document.getElementById('main-product-image');
        const currentIndex = document.getElementById('current-img-index');
        const thumbnails = document.querySelectorAll('#product-thumbnails > div');

        if (mainImage) {
            mainImage.src = imageUrl;
        }
        if (currentIndex) {
            currentIndex.textContent = index + 1;
        }


        thumbnails.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.remove('border-gray-300');
                thumb.classList.add('border-blue-500');
            } else {
                thumb.classList.remove('border-blue-500');
                thumb.classList.add('border-gray-300');
            }
        });
    };


    window.openRelatedProduct = (productId) => {
        const relatedProduct = productsData.find(p => p.id === productId);
        if (relatedProduct) {

            const currentPage = document.getElementById('product-detail-page');
            if (currentPage) currentPage.remove();


            openProductDetailPage(relatedProduct);
        }
    };

    window.toggleFeaturedStatus = async (productId) => {
        if (!isAdmin) return;

        const isFeatured = featuredProductsData.some(f => f.productId === productId);
        const btn = document.getElementById('admin-toggle-featured-btn');
        const btnText = document.getElementById('admin-featured-btn-text');

        if (btn) btn.disabled = true;

        try {
            if (isFeatured) {
                const featuredItem = featuredProductsData.find(f => f.productId === productId);
                if (featuredItem) {
                    await deleteDoc(doc(db, 'featuredProducts', featuredItem.id));
                    alertUserMessage('تم إزالة المنتج من المميزة', 'success');
                }
            } else {
                await addDoc(collection(db, 'featuredProducts'), {
                    productId: productId,
                    createdAt: new Date().toISOString(),
                    addedBy: userId
                });
                alertUserMessage('تم إضافة المنتج للمميزة', 'success');
            }

            if (btn) {
                // Toggle purely visual state optimistically (listener will update real state)
                if (isFeatured) {
                    btn.classList.replace('bg-red-600', 'bg-purple-600');
                    btn.classList.replace('hover:bg-red-700', 'hover:bg-purple-700');
                    btnText.textContent = 'إضافة للمميزة';
                } else {
                    btn.classList.replace('bg-purple-600', 'bg-red-600');
                    btn.classList.replace('hover:bg-purple-700', 'hover:bg-red-700');
                    btnText.textContent = 'إزالة من المميزة';
                }
            }

        } catch (error) {
            console.error(error);
            alertUserMessage('حدث خطأ أثناء التحديث', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    };
};


const populateCategoryDropdowns = () => {
    if (!uiElements.categoriesDropdown || !uiElements.productCategorySelect || !uiElements.editProductCategorySelect) {
        console.error("One or more category dropdown elements not found.");
        return;
    }
    const currentDropdownItems = uiElements.categoriesDropdown.querySelectorAll('.category-filter-btn:not([data-category-id="all"])');
    currentDropdownItems.forEach(item => item.remove());

    uiElements.productCategorySelect.innerHTML = '<option value="">اختر تصنيفًا</option>';
    uiElements.editProductCategorySelect.innerHTML = '<option value="">اختر تصنيفًا</option>';

    categoriesData.forEach(cat => {
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-filter-btn', 'flex', 'items-center', 'justify-between', 'w-full', 'px-4', 'py-2', 'text-white', 'hover:bg-purple-700');
        categoryItem.dataset.categoryId = cat.id;

        const categoryName = document.createElement('span');
        categoryName.textContent = cat.name;
        categoryName.classList.add('flex-1', 'text-right', 'cursor-pointer');
        categoryName.dataset.categoryId = cat.id;

        const adminButtons = document.createElement('div');
        adminButtons.classList.add('flex', 'gap-1', 'ml-2');

        if (isAdmin) {

            const editBtn = document.createElement('button');
            editBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
            `;
            editBtn.classList.add('edit-category-btn', 'text-blue-400', 'hover:text-blue-300', 'p-1', 'rounded');
            editBtn.dataset.categoryId = cat.id;
            editBtn.dataset.categoryName = cat.name;
            editBtn.title = 'تعديل التصنيف';


            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            `;
            deleteBtn.classList.add('delete-category-btn', 'text-red-400', 'hover:text-red-300', 'p-1', 'rounded');
            deleteBtn.dataset.categoryId = cat.id;
            deleteBtn.dataset.categoryName = cat.name;
            deleteBtn.title = 'حذف التصنيف';

            adminButtons.appendChild(editBtn);
            adminButtons.appendChild(deleteBtn);
        }

        categoryItem.appendChild(categoryName);
        categoryItem.appendChild(adminButtons);
        uiElements.categoriesDropdown.appendChild(categoryItem);

        const addProductOption = document.createElement('option');
        addProductOption.value = cat.id;
        addProductOption.textContent = cat.name;
        uiElements.productCategorySelect.appendChild(addProductOption);

        const editProductOption = document.createElement('option');
        editProductOption.value = cat.id;
        editProductOption.textContent = cat.name;
        uiElements.editProductCategorySelect.appendChild(editProductOption);
    });


    document.querySelectorAll('.category-filter-btn').forEach(filterBtn => {

        const clickHandler = (e) => {
            e.stopPropagation();


            let categoryId = e.target.dataset.categoryId;
            if (!categoryId && e.target.closest('.category-filter-btn')) {
                categoryId = e.target.closest('.category-filter-btn').dataset.categoryId;
            }

            if (categoryId) {
                filterProductsByCategory(categoryId);
                uiElements.categoriesDropdown.classList.add('hidden');
            }
        };

        filterBtn.addEventListener('click', clickHandler);


        const spanElement = filterBtn.querySelector('span');
        if (spanElement) {
            spanElement.addEventListener('click', clickHandler);
        }
    });


    if (isAdmin) {
        document.querySelectorAll('.edit-category-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryId = e.target.closest('button').dataset.categoryId;
                const categoryName = e.target.closest('button').dataset.categoryName;
                openEditCategoryModal(categoryId, categoryName);
            });
        });

        document.querySelectorAll('.delete-category-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const categoryId = e.target.closest('button').dataset.categoryId;
                const categoryName = e.target.closest('button').dataset.categoryName;
                await deleteCategory(categoryId, categoryName);
            });
        });
    }
};

const filterProductsByCategory = (categoryId) => {
    const filtered = productsData.filter(product => {
        return categoryId === 'all' || product.category === categoryId;
    });


    const currentUrl = new URL(window.location.href);
    if (categoryId === 'all') {
        currentUrl.hash = '';
    } else {
        const category = categoriesData.find(cat => cat.id === categoryId);
        if (category) {
            currentUrl.hash = `category-${encodeURIComponent(category.name)}`;
        }
    }
    window.history.pushState({ categoryId }, '', currentUrl.href);


    const bodyElement = document.body;


    bodyElement.classList.remove('mousepads-category');


    if (categoryId !== 'all') {
        const category = categoriesData.find(cat => cat.id === categoryId);
        if (category && category.name && category.name.includes('ماوس باد')) {
            bodyElement.classList.add('mousepads-category');
        }
    }

    displayProducts(filtered);
};


const displayCart = () => {

    if (!uiElements.cartItemsContainer) {
        uiElements.cartItemsContainer = document.getElementById('cart-items');
    }
    if (!uiElements.cartTotalElement) {
        uiElements.cartTotalElement = document.getElementById('cart-total');
    }
    if (!uiElements.cartSummaryDiv) {
        uiElements.cartSummaryDiv = document.getElementById('cart-summary');
    }
    if (!uiElements.checkoutButton) {
        uiElements.checkoutButton = document.getElementById('checkout-btn');
    }
    if (!uiElements.headerCartCount) {
        uiElements.headerCartCount = document.getElementById('header-cart-count');
    }

    console.log("displayCart: cartItemsContainer found:", !!uiElements.cartItemsContainer);

    if (!uiElements.cartItemsContainer || !uiElements.cartTotalElement || !uiElements.cartSummaryDiv || !uiElements.checkoutButton || !uiElements.headerCartCount) {
        console.error("Error: One or more cart UI elements not found when trying to display cart.");
        if (!uiElements.cartItemsContainer) console.error("cartItemsContainer is null.");
        if (!uiElements.cartTotalElement) console.error("cartTotalElement is null.");
        if (!uiElements.cartSummaryDiv) console.error("cartSummaryDiv is null.");
        if (!uiElements.checkoutButton) console.error("checkoutButton is null.");
        if (!uiElements.headerCartCount) console.error("headerCartCount is null.");
        return;
    }

    uiElements.cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (currentCart.length === 0) {
        uiElements.cartItemsContainer.innerHTML = '<p class="text-center text-white">سلة التسوق فارغة.</p>';
        uiElements.cartSummaryDiv.classList.add('hidden');
        uiElements.checkoutButton.classList.add('hidden');
    } else {

        let hasNonFreeDeliveryItems = false;

        currentCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;


            const productData = productsData.find(p => p.id === item.productId);
            if (productData && !productData.freeDelivery) {
                hasNonFreeDeliveryItems = true;
            }

            const formattedItemPrice = Math.round(item.price).toLocaleString('en-US');
            const formattedItemTotal = Math.round(itemTotal).toLocaleString('en-US');


            const freeDeliveryBadge = (productData && productData.freeDelivery) ?
                '<span class="text-xs bg-green-600 text-white px-2 py-1 rounded ml-2">توصيل مجاني</span>' : '';

            const cartItemHtml = `
                <div class="flex items-center justify-between border-b border-purple-700 py-3">
                    <div class="flex items-center">
                        <img src="${getProxiedImageUrl(item.imageUrl) || 'https://placehold.co/50x50/1a012a/ffffff?text=Item'}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md ml-4" onerror="this.onerror=null;this.src='https://placehold.co/50x50/1a012a/ffffff?text=Item';">
                        <div>
                            <h4 class="font-semibold text-white">${item.name}</h4>
                            <div class="flex items-center">
                                <p class="text-sm text-gray-300">${formattedItemPrice} د.ع x ${item.quantity}</p>
                                ${freeDeliveryBadge}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <span class="font-semibold text-white">${formattedItemTotal} د.ع</span>
                        <button data-item-id="${item.id}" class="remove-from-cart-btn mr-4 text-red-500 hover:text-red-700 transition duration-200 focus:outline-none">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            `;
            uiElements.cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHtml);
        });


        const deliveryFee = hasNonFreeDeliveryItems ? 5000 : 0;
        const grandTotal = total + deliveryFee;


        let summaryHtml = `
            <div class="flex justify-between items-center text-lg font-semibold">
                <span>المجموع الفرعي:</span>
                <span>${Math.round(total).toLocaleString('en-US')} د.ع</span>
            </div>
        `;

        if (hasNonFreeDeliveryItems) {
            summaryHtml += `
                <div class="flex justify-between items-center text-sm text-gray-300 mt-2">
                    <span>رسوم التوصيل:</span>
                    <span>${Math.round(deliveryFee).toLocaleString('en-US')} د.ع</span>
                </div>
                <div class="flex justify-between items-center text-xl font-bold text-green-400 mt-2 pt-2 border-t border-purple-600">
                    <span>المجموع الكلي (مع التوصيل):</span>
                    <span>${Math.round(grandTotal).toLocaleString('en-US')} د.ع</span>
                </div>
            `;
        } else {
            summaryHtml += `
                <div class="flex justify-between items-center text-sm text-green-400 mt-2">
                    <span>التوصيل:</span>
                    <span>مجاني</span>
                </div>
                <div class="flex justify-between items-center text-xl font-bold text-green-400 mt-2 pt-2 border-t border-purple-600">
                    <span>المجموع الكلي:</span>
                    <span>${Math.round(total).toLocaleString('en-US')} د.ع</span>
                </div>
            `;
        }

        if (userId && currentUserProfile) {
            uiElements.cartSummaryDiv.classList.remove('hidden');
            uiElements.cartSummaryDiv.innerHTML = summaryHtml;
            uiElements.checkoutButton.classList.remove('hidden');
        } else {
            uiElements.cartSummaryDiv.classList.add('hidden');
            uiElements.checkoutButton.classList.add('hidden');
            uiElements.cartItemsContainer.insertAdjacentHTML('beforeend', '<p class="text-center text-sm text-white mt-4">يرجى تسجيل الدخول لإتمام عملية الشراء.</p>');
        }
    }

    uiElements.cartTotalElement.textContent = `${Math.round(total).toLocaleString('en-US')} د.ع`;
    uiElements.headerCartCount.textContent = itemCount;

    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const itemId = e.target.closest('button').dataset.itemId;
            await removeFromCart(itemId);
        });
    });
};

const addToCart = async (product) => {
    if (!userId) {
        alertUserMessage("الرجاء تسجيل الدخول أولاً لإضافة منتجات إلى السلة.");
        return;
    }
    try {
        const cartItemRef = doc(db, `users/${userId}/cart`, product.id);
        const docSnap = await getDoc(cartItemRef);

        if (docSnap.exists()) {
            await updateDoc(cartItemRef, {
                quantity: docSnap.data().quantity + 1
            });
            alertUserMessage(`تم تحديث كمية "${product.name}" في السلة.`, 'success');
        } else {
            await setDoc(cartItemRef, {
                productId: product.id,
                name: product.name,
                price: product.discountPrice || product.price,
                imageUrl: (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
            alertUserMessage(`تمت إضافة "${product.name}" إلى السلة.`, 'success');
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        alertUserMessage(`فشل إضافة المنتج إلى السلة: ${error.message}`, 'error');
    }
};

const removeFromCart = async (itemId) => {
    if (!userId) {
        alertUserMessage("يجب تسجيل الدخول لإزالة المنتجات من السلة.", 'error');
        return;
    }
    try {
        const cartItemRef = doc(db, `users/${userId}/cart`, itemId);
        const docSnap = await getDoc(cartItemRef);

        if (docSnap.exists() && docSnap.data().quantity > 1) {
            await updateDoc(cartItemRef, { quantity: docSnap.data().quantity - 1 });
            alertUserMessage(`تم تقليل كمية العنصر في السلة.`, 'success');
        } else {
            await deleteDoc(cartItemRef);
            alertUserMessage(`تم حذف العنصر من السلة.`, 'success');
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        alertUserMessage(`فشل حذف العنصر من السلة: ${error.message}`, 'error');
    }
};


const addDeveloper = async (newUID) => {
    if (userId !== MAIN_DEVELOPER_UID) {
        alertUserMessage("فقط المطور الرئيسي يمكنه إضافة مطورين جدد.", 'error');
        return;
    }

    if (!newUID || newUID.trim() === '') {
        alertUserMessage("الرجاء إدخال UID صحيح.", 'error');
        return;
    }

    const trimmedUID = newUID.trim();

    if (developerUIDs.includes(trimmedUID)) {
        alertUserMessage("هذا المطور موجود مسبقاً في القائمة.", 'warning');
        return;
    }

    try {
        const updatedUIDs = [...developerUIDs, trimmedUID];
        const developersDocRef = doc(db, `settings`, 'developers');
        await setDoc(developersDocRef, { uids: updatedUIDs });

        developerUIDs = updatedUIDs;
        alertUserMessage("تم إضافة المطور بنجاح!", 'success');
        displayDevelopersList();
    } catch (error) {
        console.error("Error adding developer:", error);
        alertUserMessage(`فشل إضافة المطور: ${error.message}`, 'error');
    }
};

const removeDeveloper = async (uidToRemove) => {
    if (userId !== MAIN_DEVELOPER_UID) {
        alertUserMessage("فقط المطور الرئيسي يمكنه حذف المطورين.", 'error');
        return;
    }

    if (uidToRemove === MAIN_DEVELOPER_UID) {
        alertUserMessage("لا يمكن حذف المطور الرئيسي.", 'error');
        return;
    }

    const confirmRemove = await showConfirmationMessage(`هل أنت متأكد من حذف هذا المطور؟\nUID: ${uidToRemove}`);
    if (!confirmRemove) return;

    try {
        const updatedUIDs = developerUIDs.filter(uid => uid !== uidToRemove);
        const developersDocRef = doc(db, `settings`, 'developers');
        await setDoc(developersDocRef, { uids: updatedUIDs });

        developerUIDs = updatedUIDs;
        alertUserMessage("تم حذف المطور بنجاح!", 'success');
        displayDevelopersList();
    } catch (error) {
        console.error("Error removing developer:", error);
        alertUserMessage(`فشل حذف المطور: ${error.message}`, 'error');
    }
};

const displayDevelopersList = () => {
    const developersList = document.getElementById('developers-list');
    if (!developersList) return;

    developersList.innerHTML = '';

    developerUIDs.forEach(uid => {
        const isMainDeveloper = uid === MAIN_DEVELOPER_UID;
        const developerItem = `
            <div class="flex items-center justify-between p-3 bg-purple-800 rounded-lg">
                <div class="flex-1">
                    <span class="text-white font-medium">${uid}</span>
                    ${isMainDeveloper ? '<span class="text-green-400 text-xs mr-2">(المطور الرئيسي)</span>' : ''}
                </div>
                ${!isMainDeveloper ? `
                    <button onclick="removeDeveloper('${uid}')" class="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded">
                        حذف
                    </button>
                ` : ''}
            </div>
        `;
        developersList.insertAdjacentHTML('beforeend', developerItem);
    });
};


const openEditCategoryModal = (categoryId, categoryName) => {
    if (!isAdmin) return;


    const editCategoryNameInput = document.getElementById('edit-category-name');
    const editCategoryIdInput = document.getElementById('edit-category-id');
    const editCategoryModal = document.getElementById('edit-category-modal');

    if (editCategoryNameInput && editCategoryIdInput && editCategoryModal) {
        editCategoryIdInput.value = categoryId;
        editCategoryNameInput.value = categoryName;
        editCategoryModal.classList.remove('hidden');
    } else {

        const newName = prompt(`تعديل اسم التصنيف "${categoryName}":`, categoryName);
        if (newName && newName.trim() && newName.trim() !== categoryName) {
            updateCategory(categoryId, newName.trim());
        }
    }
};

const updateCategory = async (categoryId, newName) => {
    if (!isAdmin) {
        alertUserMessage("ليس لديك صلاحية تعديل التصنيفات.");
        return;
    }

    try {
        const categoryDocRef = doc(db, `categories`, categoryId);
        await updateDoc(categoryDocRef, {
            name: newName
        });
        alertUserMessage('تم تعديل التصنيف بنجاح!', 'success');
    } catch (error) {
        console.error("Error updating category:", error);
        alertUserMessage(`فشل تعديل التصنيف: ${error.message}`, 'error');
    }
};

const deleteCategory = async (categoryId, categoryName) => {
    if (!isAdmin) {
        alertUserMessage("ليس لديك صلاحية حذف التصنيفات.");
        return;
    }

    const confirmDelete = await showConfirmationMessage(`هل أنت متأكد أنك تريد حذف التصنيف "${categoryName}"؟ هذا الإجراء لا يمكن التراجع عنه.`);
    if (!confirmDelete) {
        return;
    }

    try {

        const productsUsingCategory = productsData.filter(product => product.category === categoryId);
        if (productsUsingCategory.length > 0) {
            const forceDelete = await showConfirmationMessage(`يوجد ${productsUsingCategory.length} منتج يستخدم هذا التصنيف. هل تريد المتابعة؟ سيتم تعيين هذه المنتجات كـ "غير مصنف".`);
            if (!forceDelete) {
                return;
            }


            for (const product of productsUsingCategory) {
                const productDocRef = doc(db, `products`, product.id);
                await updateDoc(productDocRef, {
                    category: null
                });
            }
        }

        const categoryDocRef = doc(db, `categories`, categoryId);
        await deleteDoc(categoryDocRef);
        alertUserMessage("تم حذف التصنيف بنجاح.", 'success');


        if (uiElements.categoriesDropdown) {
            uiElements.categoriesDropdown.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        alertUserMessage(`فشل حذف التصنيف: ${error.message}`, 'error');
    }
};


const openEditProductModal = (product) => {
    if (!isAdmin) return;
    if (!uiElements.editProductIdInput || !uiElements.editProductNameInput || !uiElements.editProductDescriptionInput || !uiElements.editProductPriceInput || !uiElements.editProductCategorySelect || !uiElements.editProductMessage || !uiElements.editProductModal) {
        console.error("One or more edit product modal elements not found.");
        return;
    }

    uiElements.editProductIdInput.value = product.id;
    uiElements.editProductNameInput.value = product.name;
    uiElements.editProductDescriptionInput.value = product.description;
    uiElements.editProductPriceInput.value = product.price;
    uiElements.editProductCategorySelect.value = product.category || '';

    // Populate colors for edit modal
    editProductColors = product.colors ? [...product.colors] : [];
    if (typeof renderEditProductColors === 'function') {
        renderEditProductColors();
    } else {
        console.error("renderEditProductColors function not found");
    }


    const hasDiscountCheckbox = document.getElementById('edit-product-has-discount');
    const discountContainer = document.getElementById('edit-product-discount-container');
    const discountPriceInput = document.getElementById('edit-product-discount-price');

    if (hasDiscountCheckbox && discountContainer && discountPriceInput) {
        if (product.discountPrice) {
            hasDiscountCheckbox.checked = true;
            discountContainer.classList.remove('hidden');
            discountPriceInput.value = product.discountPrice;
        } else {
            hasDiscountCheckbox.checked = false;
            discountContainer.classList.add('hidden');
            discountPriceInput.value = '';
        }
    }


    const editFreeDeliveryCheckbox = document.getElementById('edit-product-free-delivery');
    if (editFreeDeliveryCheckbox) {
        editFreeDeliveryCheckbox.checked = product.freeDelivery || false;
    }


    const editRemoveWhiteBgCheckbox = document.getElementById('edit-product-remove-white-bg');
    if (editRemoveWhiteBgCheckbox) {
        editRemoveWhiteBgCheckbox.checked = product.removeWhiteBackground || false;
    }


    const editAvailabilitySelect = document.getElementById('edit-product-availability');
    if (editAvailabilitySelect) {
        editAvailabilitySelect.value = product.availability || '';
    }


    for (let i = 1; i <= 5; i++) {
        const imageInput = document.getElementById(`edit-product-image-url-${i}`);
        if (imageInput) {
            if (product.imageUrls && product.imageUrls[i - 1]) {
                imageInput.value = product.imageUrls[i - 1];
            } else if (i === 1 && product.imageUrl) {

                imageInput.value = product.imageUrl;
            } else {
                imageInput.value = '';
            }
        }
    }

    uiElements.editProductMessage.textContent = '';
    uiElements.editProductModal.classList.remove('hidden');
};

const deleteProduct = async (productId) => {
    if (!isAdmin) {
        alertUserMessage("ليس لديك صلاحية حذف المنتجات.");
        return;
    }

    const confirmDelete = await showConfirmationMessage("هل أنت متأكد أنك تريد حذف هذا المنتج؟ هذا الإجراء لا يمكن التراجع عنه.");
    if (!confirmDelete) {
        return;
    }

    try {
        const productDocRef = doc(db, `products`, productId);
        await deleteDoc(productDocRef);
        alertUserMessage("تم حذف المنتج بنجاح.", 'success');
    } catch (error) {
        console.error("Error deleting product:", error);
        alertUserMessage(`فشل حذف المنتج: ${error.message}`, 'error');
    }
};


const displayReviews = (reviews) => {

    if (!uiElements.reviewsList) {
        uiElements.reviewsList = document.getElementById('reviews-list');
    }

    console.log("displayReviews: reviewsList found:", !!uiElements.reviewsList);
    if (!uiElements.reviewsList) {
        console.error("reviewsList element not found when trying to display reviews.");
        return;
    }
    uiElements.reviewsList.innerHTML = '';
    if (reviews.length === 0) {
        uiElements.reviewsList.innerHTML = '<p class="text-center text-white">لا توجد تقييمات حتى الآن.</p>';
        return;
    }

    reviews.sort((a, b) => (b.createdAt && a.createdAt) ? new Date(b.createdAt) - new Date(a.createdAt) : 0);

    reviews.forEach(review => {

        const canDeleteReview = userId && ((userId === review.userId) || isAdmin);
        const reviewHtml = `
            <div class="bg-purple-800 p-4 rounded-lg shadow-md border border-purple-700" data-review-id="${review.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <p class="text-white font-semibold">${review.userName || 'مستخدم غير معروف'}</p>
                        ${canDeleteReview ? `<button data-review-id="${review.id}" class="delete-review-btn text-red-500 hover:text-red-700 transition duration-200 focus:outline-none" title="حذف التقييم">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>` : ''}
                    </div>
                    <div class="flex text-yellow-300">
                        ${Array(review.rating).fill().map(() => `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join('')}
                    </div>
                </div>
                <p class="text-gray-300 text-sm mt-2">${review.text}</p>
                <p class="text-gray-500 text-xs mt-2">
                    ${review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar-IQ') : 'تاريخ غير متوفر'}
                </p>
            </div>
        `;
        uiElements.reviewsList.insertAdjacentHTML('beforeend', reviewHtml);
    });
    document.querySelectorAll('.delete-review-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const reviewId = e.target.closest('button').dataset.reviewId;
            const confirmDelete = await showConfirmationMessage("هل أنت متأكد أنك تريد حذف هذا التقييم؟");
            if (confirmDelete) {
                await deleteReview(reviewId);
            }
        });
    });
};

const deleteReview = async (reviewId) => {
    if (!userId) {
        alertUserMessage("يرجى تسجيل الدخول لحذف التقييم.", 'error');
        return;
    }

    if (!currentUserProfile) {
        alertUserMessage("يرجى إكمال تسجيل الدخول أولاً.", 'error');
        return;
    }

    try {

        const reviewToDelete = reviewsData.find(review => review.id === reviewId);
        if (!reviewToDelete) {
            alertUserMessage("التقييم غير موجود.", 'error');
            return;
        }

        console.log("Review data:", reviewToDelete);
        console.log("Current user ID:", userId);
        console.log("Review user ID:", reviewToDelete.userId);
        console.log("Is admin:", isAdmin);

        if (reviewToDelete.userId !== userId && !isAdmin) {
            alertUserMessage("ليس لديك صلاحية لحذف هذا التقييم. يمكنك حذف تقييماتك فقط.", 'error');
            return;
        }

        const reviewDocRef = doc(db, `reviews`, reviewId);
        await deleteDoc(reviewDocRef);
        alertUserMessage("تم حذف التقييم بنجاح.", 'success');
    } catch (error) {
        console.error("Error deleting review:", error);
        if (error.code === 'permission-denied') {
            alertUserMessage("خطأ في الأذونات: تأكد من أن قواعد أمان Firebase تسمح لك بحذف تقييماتك الخاصة.", 'error');
        } else {
            alertUserMessage(`فشل حذف التقييم: ${error.message}`, 'error');
        }
    }
};


// Function to populate checkout modal for direct purchase with color selector
window.populateCheckoutModalDirectPurchase = function (product) {
    const checkoutProductsList = document.getElementById('checkout-products-list');
    const checkoutGrandTotal = document.getElementById('checkout-grand-total');

    if (!checkoutProductsList || !checkoutGrandTotal) return;

    if (!currentUserProfile || !userId) {
        alertUserMessage("يرجى تسجيل الدخول أولاً لتعبئة معلومات الشحن.", 'warning');
        return;
    }

    uiElements.checkoutNameInput.value = currentUserProfile.fullName || '';
    uiElements.checkoutPhoneInput.value = (currentUserProfile.phoneNumber || '').replace('+964', '');
    uiElements.checkoutGovernorateSelect.value = currentUserProfile.governorate || '';
    uiElements.checkoutDistrictInput.value = currentUserProfile.district || '';
    uiElements.checkoutNotesTextarea.value = '';

    const displayPrice = product.discountPrice || product.price;
    const deliveryCost = product.freeDelivery ? 0 : 5000;
    const grandTotal = displayPrice + deliveryCost;

    // Get product image
    const mainImageUrl = getProxiedImageUrl((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl);

    // Create color selector HTML if product has colors
    const colorSelectorHtml = product.colors && product.colors.length > 0 ?
        window.createColorSelector(product.colors, product.id) : '';

    checkoutProductsList.innerHTML = `
        <div class="bg-purple-700 p-3 rounded-lg">
            <div class="flex items-center gap-3 mb-3 border-b border-purple-600 pb-3">
                <img src="${mainImageUrl}" alt="${product.name}" class="w-16 h-16 object-cover rounded-md border border-purple-500">
                <div class="flex-1">
                    <h4 class="text-white font-semibold text-lg">${product.name}</h4>
                    <p class="text-purple-200 text-sm">${Math.round(displayPrice).toLocaleString('en-US')} د.ع</p>
                </div>
            </div>
            ${colorSelectorHtml}
        </div>
        ${!product.freeDelivery ? `
        <div class="flex justify-between items-center text-sm text-purple-300 mt-2">
            <span>التوصيل:</span>
            <span>${deliveryCost.toLocaleString('en-US')} د.ع</span>
        </div>
        ` : `
        <div class="flex justify-between items-center text-sm text-green-400 mt-2">
            <span>التوصيل:</span>
            <span>مجاني</span>
        </div>
        `}
    `;

    checkoutGrandTotal.textContent = `${Math.round(grandTotal).toLocaleString('en-US')} د.ع`;

    // Store product reference and clear any previous selection
    window.currentCheckoutProduct = product;

    // Clear previously selected color for this product ID in this session context if needed
    // or keep it if we want to persist. Usually better to clear for a fresh "Buy Now".
    // But selectProductColor uses global storage. 
    // Ideally we should adhere to what the user last picked or reset.
    // Let's reset the selection visually (state is in global object).
    // Actually, createColorSelector generates new buttons, so visual state is reset. 
    // We should probably clear the global state for this product to avoid stale data.
    if (selectedProductColors[product.id]) delete selectedProductColors[product.id];
};

// Helper function to get selected color info for order
window.getSelectedColorForOrder = function (productId) {
    const selectedColor = window.getSelectedProductColor(productId);
    if (!selectedColor) return null;

    return {
        name: selectedColor,
        displayText: `اللون: ${selectedColor}`
    };
};

// Helper function to validate color selection before checkout
window.validateColorSelection = function (product) {
    if (!product || !product.colors || product.colors.length === 0) {
        return { valid: true, message: '' };
    }

    const selectedColor = window.getSelectedProductColor(product.id);
    if (!selectedColor) {
        return {
            valid: false,
            message: 'الرجاء اختيار اللون قبل إتمام الطلب'
        };
    }

    return { valid: true, message: '', color: selectedColor };
};


const populateCheckoutModal = () => {
    window.currentCheckoutProduct = null;
    if (!uiElements.checkoutNameInput || !uiElements.checkoutPhoneInput || !uiElements.checkoutGovernorateSelect || !uiElements.checkoutDistrictInput || !uiElements.checkoutNotesTextarea || !uiElements.checkoutProductsList || !uiElements.checkoutGrandTotal) {
        console.error("One or more checkout modal elements not found.");
        return;
    }

    if (!currentUserProfile || !userId) {
        alertUserMessage("يرجى تسجيل الدخول أولاً لتعبئة معلومات الشحن.", 'warning');
        return;
    }
    if (currentCart.length === 0) {
        alertUserMessage("سلة التسوق فارغة. الرجاء إضافة منتجات قبل إتمام الشراء.", 'warning');
        return;
    }

    uiElements.checkoutNameInput.value = currentUserProfile.fullName || '';
    uiElements.checkoutPhoneInput.value = (currentUserProfile.phoneNumber || '').replace('+964', '');
    uiElements.checkoutGovernorateSelect.value = currentUserProfile.governorate || '';
    uiElements.checkoutDistrictInput.value = currentUserProfile.district || '';
    uiElements.checkoutNotesTextarea.value = '';

    uiElements.checkoutProductsList.innerHTML = '';
    let orderSubtotal = 0;
    let hasNonFreeDeliveryItems = false;

    currentCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        orderSubtotal += itemTotal;


        const productData = productsData.find(p => p.id === item.productId);
        if (productData && !productData.freeDelivery) {
            hasNonFreeDeliveryItems = true;
        }

        const formattedItemTotal = Math.round(itemTotal).toLocaleString('en-US');

        // Create color selector HTML if product has colors
        const colorSelectorHtml = productData && productData.colors && productData.colors.length > 0 ?
            window.createColorSelector(productData.colors, item.productId) : '';

        const freeDeliveryBadge = (productData && productData.freeDelivery) ?
            '<span class="text-xs bg-green-600 text-white px-1 py-0.5 rounded mr-2">توصيل مجاني</span>' : '';

        const productItemHtml = `
            <div class="mb-4 bg-purple-700 p-3 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <img src="${getProxiedImageUrl(item.imageUrl) || 'https://placehold.co/40x40/1a012a/ffffff?text=Item'}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md ml-2 border border-purple-500" onerror="this.onerror=null;this.src='https://placehold.co/40x40/1a012a/ffffff?text=Item';">
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-white">${item.name} (x${item.quantity})</span>
                            ${freeDeliveryBadge}
                        </div>
                    </div>
                    <span class="text-sm font-medium text-white">${formattedItemTotal} د.ع</span>
                </div>
                ${colorSelectorHtml}
            </div>
        `;
        uiElements.checkoutProductsList.insertAdjacentHTML('beforeend', productItemHtml);
    });


    const deliveryFee = hasNonFreeDeliveryItems ? 5000 : 0;
    const grandTotal = orderSubtotal + deliveryFee;


    let summaryHtml = `
        <div class="border-t border-purple-600 pt-2 mt-2">
            <div class="flex justify-between text-sm">
                <span>المجموع الفرعي:</span>
                <span>${Math.round(orderSubtotal).toLocaleString('en-US')} د.ع</span>
            </div>
    `;

    if (hasNonFreeDeliveryItems) {
        summaryHtml += `
            <div class="flex justify-between text-sm mt-1">
                <span>رسوم التوصيل:</span>
                <span>${Math.round(deliveryFee).toLocaleString('en-US')} د.ع</span>
            </div>
        `;
    } else {
        summaryHtml += `
            <div class="flex justify-between text-sm text-green-400 mt-1">
                <span>التوصيل:</span>
                <span>مجاني</span>
            </div>
        `;
    }

    summaryHtml += `</div>`;
    uiElements.checkoutProductsList.insertAdjacentHTML('beforeend', summaryHtml);

    uiElements.checkoutGrandTotal.textContent = `${Math.round(grandTotal).toLocaleString('en-US')} د.ع`;
};


const uploadImageToImgBB = async (file) => {
    try {

        if (file.size > 10 * 1024 * 1024) {
            throw new Error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت.');
        }


        if (!file.type.startsWith('image/')) {
            throw new Error('يرجى اختيار ملف صورة فقط.');
        }

        console.log('Uploading image to ImgBB...', file.name);

        const formData = new FormData();
        formData.append('image', file);


        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds 

        let response;
        try {
            response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);


            if (fetchError.name === 'AbortError') {
                throw new Error('انتهت مهلة رفع الصورة (90 ثانية). قد يكون الاتصال ضعيفاً، حاول مرة أخرى أو استخدم صورة أصغر.');
            } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
                throw new Error('فشل الاتصال بخادم الصور. تحقق من اتصالك بالإنترنت.');
            } else {
                throw new Error(`خطأ في الشبكة: ${fetchError.message}`);
            }
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ImgBB API Error Response:', errorText);
            throw new Error(`فشل رفع الصورة (${response.status}). يرجى المحاولة مرة أخرى.`);
        }

        const data = await response.json();
        console.log('ImgBB Response:', data);

        if (data.success && data.data) {

            const imageUrl = data.data.display_url || data.data.url;
            console.log('Image uploaded successfully:', imageUrl);
            return imageUrl;
        } else {
            const errorMsg = data.error?.message || 'فشل رفع الصورة';
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Error uploading image:', error);


        if (error.message.includes('حجم الصورة')) {
            throw error;
        } else if (error.message.includes('ملف صورة')) {
            throw error;
        } else if (error.message.includes('الاتصال') || error.message.includes('الشبكة')) {
            throw new Error('فشل الاتصال بخادم الصور. تأكد من:\n1. اتصالك بالإنترنت\n2. عدم وجود جدار حماية يمنع الوصول\n3. المحاولة مرة أخرى بعد قليل');
        } else {
            throw new Error(`فشل رفع الصورة: ${error.message}`);
        }
    }
};


const handleProductImageUpload = async (imageIndex) => {
    const fileInput = document.getElementById(`product-image-file-${imageIndex}`);
    const preview = document.getElementById(`product-image-preview-${imageIndex}`);
    const progress = document.getElementById(`product-image-progress-${imageIndex}`);
    const urlInput = document.getElementById(`product-image-url-${imageIndex}`);

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        return;
    }

    const file = fileInput.files[0];

    try {

        if (preview) preview.classList.add('hidden');
        if (progress) {
            progress.classList.remove('hidden');
            const progressBar = progress.querySelector('.bg-blue-600');
            if (progressBar) progressBar.style.width = '30%';
        }


        const imageUrl = await uploadImageToImgBB(file);


        if (progress) {
            const progressBar = progress.querySelector('.bg-blue-600');
            if (progressBar) progressBar.style.width = '100%';
        }


        if (urlInput) urlInput.value = imageUrl;


        setTimeout(() => {
            if (progress) progress.classList.add('hidden');
            if (preview) {
                const img = preview.querySelector('img');
                if (img) img.src = getProxiedImageUrl(imageUrl);
                preview.classList.remove('hidden');
            }
        }, 500);

    } catch (error) {
        console.error('Error in handleProductImageUpload:', error);
        alertUserMessage(error.message || 'فشل رفع الصورة', 'error');


        if (progress) progress.classList.add('hidden');


        fileInput.value = '';
    }
};


window.uploadImageToImgBB = uploadImageToImgBB;
window.handleProductImageUpload = handleProductImageUpload;


window.clearProductImage = (imageIndex) => {
    const fileInput = document.getElementById(`product-image-file-${imageIndex}`);
    const preview = document.getElementById(`product-image-preview-${imageIndex}`);
    const progress = document.getElementById(`product-image-progress-${imageIndex}`);
    const urlInput = document.getElementById(`product-image-url-${imageIndex}`);

    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    if (preview) preview.classList.add('hidden');
    if (progress) progress.classList.add('hidden');
};


const setupEventListeners = () => {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    });
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.add('hidden');
        });
    });


    if (uiElements.messageBoxConfirmBtn) {
        uiElements.messageBoxConfirmBtn.addEventListener('click', () => {
            if (resolveMessageBoxPromise) {
                resolveMessageBoxPromise(true);
                resolveMessageBoxPromise = null;
            }
            if (uiElements.messageBox) uiElements.messageBox.classList.add('hidden');
            const overlay = document.getElementById('message-box-overlay');
            if (overlay) overlay.classList.add('hidden');
        });
    }
    if (uiElements.messageBoxCancelBtn) {
        uiElements.messageBoxCancelBtn.addEventListener('click', () => {
            if (resolveMessageBoxPromise) {
                resolveMessageBoxPromise(false);
                resolveMessageBoxPromise = null;
            }
            if (uiElements.messageBox) uiElements.messageBox.classList.add('hidden');
            const overlay = document.getElementById('message-box-overlay');
            if (overlay) overlay.classList.add('hidden');
        });
    }


    if (uiElements.loginProfileBtn) {
        uiElements.loginProfileBtn.addEventListener('click', () => {
            if (currentUserProfile) {

                uiElements.loginProfileBtn.innerHTML = '<img id="profile-icon" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" class="w-6 h-6">';
                if (uiElements.profileDetailsModal) uiElements.profileDetailsModal.classList.remove('hidden');
            } else {
                if (uiElements.loginModal) uiElements.loginModal.classList.remove('hidden');
            }
        });
    }


    const searchInput = document.getElementById('main-search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');

    if (searchInput && suggestionsContainer) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim().toLowerCase();

            if (searchTerm.length < 1) {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.add('hidden');
                displayProducts(productsData);
                return;
            }

            const filteredProducts = productsData.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                (p.sku && p.sku.toLowerCase().includes(searchTerm))
            );

            if (filteredProducts.length > 0) {
                suggestionsContainer.innerHTML = '';
                filteredProducts.slice(0, 6).forEach(product => {
                    const price = product.discountPrice || product.price;
                    const mainImageUrl = getProxiedImageUrl((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl);

                    const suggestionHtml = `
                        <div class="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors" data-sku="${product.sku}">
                            <img src="${mainImageUrl}" alt="${product.name}" class="w-12 h-12 object-contain rounded bg-gray-50">
                            <div class="flex-1 text-right">
                                <h4 class="text-sm font-bold text-gray-800 truncate">${product.name}</h4>
                                <div class="flex justify-between items-center mt-1">
                                    <span class="text-xs text-blue-600 font-mono">${product.sku || ''}</span>
                                    <span class="text-xs font-bold text-green-600">${Math.round(price).toLocaleString('en-US')} د.ع</span>
                                </div>
                            </div>
                        </div>
                    `;
                    suggestionsContainer.insertAdjacentHTML('beforeend', suggestionHtml);
                });

                suggestionsContainer.classList.remove('hidden');


                suggestionsContainer.querySelectorAll('div[data-sku]').forEach(div => {
                    div.addEventListener('click', () => {
                        const sku = div.dataset.sku;
                        const product = productsData.find(p => p.sku === sku);
                        if (product) {
                            openProductDetailPage(product);
                            suggestionsContainer.classList.add('hidden');
                            searchInput.value = '';
                        }
                    });
                });
            } else {
                suggestionsContainer.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">لا توجد نتائج مطابقة</div>';
                suggestionsContainer.classList.remove('hidden');
            }


            displayProducts(filteredProducts);
        });


        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }


    let isLoginMode = true;


    const authTypeSelection = document.getElementById('auth-type-selection');
    const authFormContainer = document.getElementById('auth-form-container');
    const selectLoginBtn = document.getElementById('select-login-btn');
    const selectRegisterBtn = document.getElementById('select-register-btn');
    const loginTabBtn = document.getElementById('login-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');
    const loginModalTitle = document.getElementById('login-modal-title');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const fullNameInput = document.getElementById('full-name');
    const phoneNumberInput = document.getElementById('phone-number');
    const fullNameError = document.getElementById('full-name-error');
    const phoneNumberError = document.getElementById('phone-number-error');


    const convertArabicToEnglish = (str) => {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let result = str;
        arabicNumbers.forEach((arabic, index) => {
            result = result.replace(new RegExp(arabic, 'g'), englishNumbers[index]);
        });
        return result;
    };


    const validateForm = () => {
        let isValid = true;


        if (fullNameError) {
            fullNameError.classList.add('hidden');
            fullNameError.textContent = '';
        }
        if (phoneNumberError) {
            phoneNumberError.classList.add('hidden');
            phoneNumberError.textContent = '';
        }


        const fullName = fullNameInput ? fullNameInput.value.trim() : '';
        if (!fullName) {
            if (fullNameError) {
                fullNameError.textContent = 'الاسم الكامل مطلوب';
                fullNameError.classList.remove('hidden');
            }
            isValid = false;
        } else if (fullName.length < 3) {
            if (fullNameError) {
                fullNameError.textContent = 'الاسم يجب أن يكون 3 أحرف على الأقل';
                fullNameError.classList.remove('hidden');
            }
            isValid = false;
        } else if (!/^[\u0600-\u06FF\s]+$/.test(fullName)) {
            if (fullNameError) {
                fullNameError.textContent = 'الاسم يجب أن يحتوي على أحرف عربية فقط';
                fullNameError.classList.remove('hidden');
            }
            isValid = false;
        }


        let phoneNumberDigits = phoneNumberInput ? phoneNumberInput.value.trim() : '';
        if (!phoneNumberDigits) {
            if (phoneNumberError) {
                phoneNumberError.textContent = 'رقم الهاتف مطلوب';
                phoneNumberError.classList.remove('hidden');
            }
            isValid = false;
        } else {

            phoneNumberDigits = convertArabicToEnglish(phoneNumberDigits);

            phoneNumberDigits = phoneNumberDigits.replace(/\D/g, '');


            if (phoneNumberDigits.length !== 10 && phoneNumberDigits.length !== 11) {
                if (phoneNumberError) {
                    phoneNumberError.textContent = 'رقم الهاتف يجب أن يكون 10 أو 11 رقمًا';
                    phoneNumberError.classList.remove('hidden');
                }
                isValid = false;
            } else if (!/^[0-9]{10,11}$/.test(phoneNumberDigits)) {
                if (phoneNumberError) {
                    phoneNumberError.textContent = 'رقم الهاتف غير صحيح';
                    phoneNumberError.classList.remove('hidden');
                }
                isValid = false;
            }
        }

        return { isValid, fullName, phoneNumberDigits };
    };


    const showAuthForm = (mode) => {
        isLoginMode = mode;
        if (authTypeSelection) authTypeSelection.classList.add('hidden');
        if (authFormContainer) authFormContainer.classList.remove('hidden');


        if (isLoginMode) {
            if (loginTabBtn) {
                loginTabBtn.classList.remove('bg-gray-600');
                loginTabBtn.classList.add('bg-blue-600');
            }
            if (registerTabBtn) {
                registerTabBtn.classList.remove('bg-blue-600');
                registerTabBtn.classList.add('bg-gray-600');
            }
            if (loginModalTitle) loginModalTitle.textContent = 'تسجيل الدخول';
            if (loginSubmitBtn) loginSubmitBtn.textContent = 'تسجيل الدخول';
        } else {
            if (registerTabBtn) {
                registerTabBtn.classList.remove('bg-gray-600');
                registerTabBtn.classList.add('bg-blue-600');
            }
            if (loginTabBtn) {
                loginTabBtn.classList.remove('bg-blue-600');
                loginTabBtn.classList.add('bg-gray-600');
            }
            if (loginModalTitle) loginModalTitle.textContent = 'إنشاء حساب';
            if (loginSubmitBtn) loginSubmitBtn.textContent = 'إنشاء حساب';
        }
    };


    if (selectLoginBtn) {
        selectLoginBtn.addEventListener('click', () => showAuthForm(true));
    }
    if (selectRegisterBtn) {
        selectRegisterBtn.addEventListener('click', () => showAuthForm(false));
    }


    if (loginTabBtn && registerTabBtn) {
        loginTabBtn.addEventListener('click', () => {
            isLoginMode = true;
            loginTabBtn.classList.remove('bg-gray-600');
            loginTabBtn.classList.add('bg-blue-600');
            registerTabBtn.classList.remove('bg-blue-600');
            registerTabBtn.classList.add('bg-gray-600');
            if (loginModalTitle) loginModalTitle.textContent = 'تسجيل الدخول';
            if (loginSubmitBtn) loginSubmitBtn.textContent = 'تسجيل الدخول';
        });

        registerTabBtn.addEventListener('click', () => {
            isLoginMode = false;
            registerTabBtn.classList.remove('bg-gray-600');
            registerTabBtn.classList.add('bg-blue-600');
            loginTabBtn.classList.remove('bg-blue-600');
            loginTabBtn.classList.add('bg-gray-600');
            if (loginModalTitle) loginModalTitle.textContent = 'إنشاء حساب';
            if (loginSubmitBtn) loginSubmitBtn.textContent = 'إنشاء حساب';
        });
    }


    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        const modalCloseBtn = loginModal.querySelector('.modal-close-btn');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                if (authTypeSelection) authTypeSelection.classList.remove('hidden');
                if (authFormContainer) authFormContainer.classList.add('hidden');
                if (uiElements.loginForm) uiElements.loginForm.reset();
                if (fullNameError) fullNameError.classList.add('hidden');
                if (phoneNumberError) phoneNumberError.classList.add('hidden');
            });
        }
    }


    if (uiElements.loginForm) {
        uiElements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!firebaseInitialized || !auth || !db) {
                alertUserMessage("نظام تسجيل الدخول غير جاهز بعد. الرجاء المحاولة مرة أخرى بعد قليل.", 'warning');
                return;
            }


            const validation = validateForm();
            if (!validation.isValid) {
                return;
            }

            const fullName = validation.fullName;
            let phoneNumberDigits = validation.phoneNumberDigits;

            const fullPhoneNumber = `+964${phoneNumberDigits}`;
            console.log("Attempting to register/login with:", { fullName, fullPhoneNumber, isLoginMode });

            try {
                if (isLoginMode) {

                    const existingUser = await findExistingUser(fullName, fullPhoneNumber);

                    if (existingUser) {

                        console.log("Existing user found, logging in:", existingUser.userId);


                        const existingUserId = existingUser.userId;
                        currentUserProfile = existingUser.data;


                        if (uiElements.profileDetailsName) uiElements.profileDetailsName.textContent = existingUser.data.fullName || 'مستخدم';
                        if (uiElements.profileDetailsPhone) uiElements.profileDetailsPhone.textContent = existingUser.data.phoneNumber || 'N/A';
                        if (uiElements.profileDetailsImage) uiElements.profileDetailsImage.src = existingUser.data.profilePicUrl || 'https://placehold.co/100x100/eeeeee/333333?text=User';

                        if (existingUser.data.createdAt) {
                            const date = new Date(existingUser.data.createdAt);
                            if (uiElements.profileDetailsRegisteredDate) uiElements.profileDetailsRegisteredDate.textContent = `تاريخ التسجيل: ${date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })} في ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
                        }


                        setupRealtimeListeners();
                        alertUserMessage(`مرحباً بعودتك ${existingUser.data.fullName}! تم تسجيل دخولك بنجاح.`, 'success');


                        setTimeout(() => {
                            if (uiElements.loginModal) uiElements.loginModal.classList.add('hidden');
                            if (authTypeSelection) authTypeSelection.classList.remove('hidden');
                            if (authFormContainer) authFormContainer.classList.add('hidden');
                            if (uiElements.loginForm) uiElements.loginForm.reset();
                            if (fullNameError) fullNameError.classList.add('hidden');
                            if (phoneNumberError) phoneNumberError.classList.add('hidden');
                        }, 1500);
                    } else {
                        alertUserMessage('هذا الحساب غير موجود. يرجى التحقق من المعلومات أو إنشاء حساب جديد.', 'error');
                        return;
                    }
                } else {

                    const phoneExists = await checkPhoneExists(fullPhoneNumber);
                    if (phoneExists) {
                        alertUserMessage('رقم الهاتف مسجل مسبقاً. يرجى استخدام رقم آخر أو تسجيل الدخول.', 'error');
                        return;
                    }


                    if (!userId) {
                        if (!auth.currentUser) {
                            await signInAnonymously(auth);
                        }
                        userId = auth.currentUser.uid;
                    }

                    console.log("Creating new user with UID:", userId);

                    const existingProfileRef = doc(db, 'users', userId);
                    const existingProfileSnap = await getDoc(existingProfileRef);

                    if (existingProfileSnap.exists()) {
                        await updateDoc(existingProfileRef, {
                            fullName: fullName,
                            phoneNumber: fullPhoneNumber,
                            updatedAt: new Date().toISOString()
                        });
                        console.log("Updated existing user profile in Firestore.");
                        alertUserMessage('تم تحديث بيانات حسابك بنجاح!', 'success');
                    } else {
                        const newUserData = {
                            fullName: fullName,
                            phoneNumber: fullPhoneNumber,
                            profilePicUrl: 'https://placehold.co/100x100/eeeeee/333333?text=User',
                            createdAt: new Date().toISOString()
                        };

                        await setDoc(existingProfileRef, newUserData);
                        console.log("New user profile created in Firestore.");
                        alertUserMessage('تم إنشاء حساب جديد بنجاح!', 'success');
                    }

                    const updatedProfileSnap = await getDoc(existingProfileRef);
                    currentUserProfile = updatedProfileSnap.data();
                }


                if (developerUIDs.includes(userId)) {

                    isAdmin = true;
                    if (uiElements.developerButtons) uiElements.developerButtons.classList.remove('hidden');
                    if (uiElements.developerStatus) uiElements.developerStatus.classList.remove('hidden');
                    console.log("Admin status updated immediately based on UID.");
                }

                await fetchAdminStatus();


                uiElements.loginProfileBtn.innerHTML = '<img id="profile-icon" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" class="w-6 h-6">';


                if (uiElements.loginProfileText) uiElements.loginProfileText.textContent = 'حسابي';
                if (uiElements.profileDetailsLogoutBtn) uiElements.profileDetailsLogoutBtn.classList.remove('hidden');
                if (uiElements.profileDetailsLoginBtn) uiElements.profileDetailsLoginBtn.classList.add('hidden');


                if (developerUIDs.includes(userId)) {
                    setTimeout(() => {
                        const adminType = userId === MAIN_DEVELOPER_UID ? 'المطور الرئيسي' : 'مطور';
                        alertUserMessage(`مرحباً ${adminType}! تم تفعيل صلاحيات الإدارة.`, 'success');
                    }, 2000);
                    setTimeout(() => {
                        fetchAndDisplayUserCount();
                    }, 3000);
                }

                setTimeout(() => {
                    if (uiElements.loginModal) uiElements.loginModal.classList.add('hidden');
                    if (uiElements.loginMessage) uiElements.loginMessage.textContent = '';
                    if (authTypeSelection) authTypeSelection.classList.remove('hidden');
                    if (authFormContainer) authFormContainer.classList.add('hidden');
                    if (uiElements.loginForm) uiElements.loginForm.reset();
                    if (fullNameError) {
                        fullNameError.classList.add('hidden');
                        fullNameError.textContent = '';
                    }
                    if (phoneNumberError) {
                        phoneNumberError.classList.add('hidden');
                        phoneNumberError.textContent = '';
                    }
                }, 1500);

            } catch (error) {
                console.error("Error during registration/login:", error);
                alertUserMessage(`فشل التسجيل/تسجيل الدخول: ${error.message}`, 'error');
            }
        });
    }


    if (uiElements.profileDetailsLogoutBtn) {
        uiElements.profileDetailsLogoutBtn.addEventListener('click', async () => {
            try {

                if (cartUnsubscribe) {
                    cartUnsubscribe();
                    cartUnsubscribe = null;
                }
                if (ordersUnsubscribe) {
                    ordersUnsubscribe();
                    ordersUnsubscribe = null;
                }

                if (userId) {

                    currentCart = [];
                    currentUserProfile = null;
                    isAdmin = false;


                    if (uiElements.developerButtons) uiElements.developerButtons.classList.add('hidden');
                    if (uiElements.developerStatus) uiElements.developerStatus.classList.add('hidden');
                }


                await signOut(auth);
                console.log("User signed out.");


                uiElements.loginProfileBtn.textContent = 'حسابي';
                if (uiElements.profileDetailsModal) uiElements.profileDetailsModal.classList.add('hidden');


                userId = null;
            }
            catch (error) {
                console.error("Error signing out:", error);
                alertUserMessage("حدث خطأ أثناء تسجيل الخروج.", 'error');
            }
        });
    }
    if (uiElements.profileDetailsLoginBtn) {
        uiElements.profileDetailsLoginBtn.addEventListener('click', () => {
            if (uiElements.profileDetailsModal) uiElements.profileDetailsModal.classList.add('hidden');
            if (uiElements.loginModal) uiElements.loginModal.classList.remove('hidden');
        });
    }


    if (uiElements.headerCartBtn) {
        uiElements.headerCartBtn.addEventListener('click', () => {
            if (uiElements.shoppingCartModal) uiElements.shoppingCartModal.classList.remove('hidden');
        });
    }


    if (uiElements.addToCartDetailBtn) {
        uiElements.addToCartDetailBtn.addEventListener('click', async () => {
            const productId = uiElements.addToCartDetailBtn.dataset.productId;
            const productToAdd = productsData.find(p => p.id === productId);
            if (productToAdd && userId) {
                await addToCart(productToAdd);
                if (uiElements.productDetailModal) uiElements.productDetailModal.classList.add('hidden');
            } else if (!userId) {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإضافة منتجات إلى السلة.");
            }
        });
    }


    if (uiElements.buyNowDetailBtn) {
        uiElements.buyNowDetailBtn.addEventListener('click', async () => {
            if (!userId || !currentUserProfile) {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإتمام عملية الشراء.", 'warning');
                return;
            }

            const productId = uiElements.buyNowDetailBtn.dataset.productId;
            const productToBuy = productsData.find(p => p.id === productId);

            if (productToBuy) {

                const mainImageUrl = (productToBuy.imageUrls && productToBuy.imageUrls.length > 0) ? productToBuy.imageUrls[0] : productToBuy.imageUrl;


                const tempCart = [{
                    id: productToBuy.id,
                    productId: productToBuy.id,
                    name: productToBuy.name,
                    price: productToBuy.discountPrice || productToBuy.price,
                    imageUrl: mainImageUrl,
                    quantity: 1
                }];


                orderCartData = [...tempCart];


                populateCheckoutModalDirectPurchase(productToBuy);


                if (uiElements.productDetailModal) uiElements.productDetailModal.classList.add('hidden');
                if (uiElements.checkoutModal) uiElements.checkoutModal.classList.remove('hidden');
            }
        });
    }


    if (uiElements.checkoutButton) {
        uiElements.checkoutButton.addEventListener('click', async () => {
            if (!userId || !currentUserProfile) {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإتمام عملية الشراء.", 'warning');
                return;
            }
            if (currentCart.length === 0) {
                alertUserMessage("سلة التسوق فارغة. الرجاء إضافة منتجات.", 'warning');
                return;
            }


            orderCartData = [...currentCart];

            populateCheckoutModal();
            if (uiElements.checkoutModal) uiElements.checkoutModal.classList.remove('hidden');
        });
    }


    if (uiElements.checkoutForm) {
        uiElements.checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate Color Selection for Direct Purchase
            if (window.currentCheckoutProduct) {
                const validation = window.validateColorSelection(window.currentCheckoutProduct);
                if (!validation.valid) {
                    alertUserMessage(validation.message, 'error');
                    return;
                }
            } else {
                // Validate Color Selection for Cart Purchase
                const cartToProcess = orderCartData.length > 0 ? orderCartData : currentCart;
                for (const item of cartToProcess) {
                    const product = productsData.find(p => p.id === item.productId);
                    if (product) {
                        const validation = window.validateColorSelection(product);
                        if (!validation.valid) {
                            alertUserMessage(`الرجاء اختيار لون للمنتج: ${item.name}`, 'error');
                            return;
                        }
                    }
                }
            }

            const fullName = uiElements.checkoutNameInput.value.trim();
            const governorate = uiElements.checkoutGovernorateSelect.value;
            const district = uiElements.checkoutDistrictInput.value.trim();
            const phoneNumberDigits = uiElements.checkoutPhoneInput.value.trim();
            const notes = uiElements.checkoutNotesTextarea.value.trim();
            const fullPhoneNumber = `+964${phoneNumberDigits}`;

            if (!fullName || !governorate || !district || !phoneNumberDigits) {
                alertUserMessage('الرجاء تعبئة جميع الحقول المطلوبة.', 'error');
                return;
            }

            const phoneRegex = /^[0-9]{11}$/;
            if (!phoneRegex.test(phoneNumberDigits)) {
                alertUserMessage('الرجاء إدخال 11 رقمًا صحيحًا لرقم الهاتف بعد 964.', 'error');
                return;
            }

            try {

                const cartToProcess = orderCartData.length > 0 ? orderCartData : currentCart;

                if (cartToProcess.length === 0) {
                    alertUserMessage('لا توجد منتجات في الطلب.', 'error');
                    return;
                }


                const orderId = `order_${Date.now()}_${userId}`;

                const shortOrderId = orderId.substring(6, 20);
                const shortUserId = userId.substring(0, 8);
                const callbackData = `rev_${shortOrderId}_${shortUserId}`;
                const orderData = {
                    orderId: orderId,
                    userId: userId,
                    fullName: fullName,
                    phoneNumber: fullPhoneNumber,
                    governorate: governorate,
                    district: district,
                    notes: notes || '',
                    items: cartToProcess.map(item => {
                        const selectedColor = window.getSelectedProductColor(item.productId || item.id);
                        return {
                            productId: item.productId || item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            color: selectedColor || null
                        };
                    }),
                    totalAmount: orderCartData.reduce((total, item) => total + (item.price * item.quantity), 0),
                    status: 'received',
                    createdAt: new Date().toISOString()
                };

                // Add colors to webhook embed
                const embeds = cartToProcess.map(item => {
                    const selectedColor = window.getSelectedProductColor(item.productId || item.id);
                    const colorText = selectedColor ? `\nاللون: **${selectedColor}**` : '';
                    return {
                        title: `تفاصيل المنتج: ${item.name}`,
                        description: `الكمية: ${item.quantity}\nالسعر: ${item.price} د.ع${colorText}`,
                        color: 5814783,
                        fields: [
                            { name: "معرف المنتج", value: item.productId || item.id, inline: true }
                        ],
                        thumbnail: {
                            url: item.imageUrl || ''
                        }
                    };
                });


                let cartTotalForBot = 0;
                let hasNonFreeDeliveryItems = false;
                cartToProcess.forEach((item) => {
                    const productData = productsData.find(p => p.id === (item.productId || item.id));
                    if (productData && !productData.freeDelivery) {
                        hasNonFreeDeliveryItems = true;
                    }
                    cartTotalForBot += (item.price * item.quantity);
                });
                const deliveryFee = hasNonFreeDeliveryItems ? 5000 : 0;
                orderData.total = cartTotalForBot + deliveryFee;
                orderData.deliveryFee = deliveryFee;


                orderData.callbackData = callbackData;


                const orderDocRef = await addDoc(collection(db, `users/${userId}/orders`), orderData);


                const orderImages = [];
                for (const item of cartToProcess) {
                    const productData = productsData.find(p => p.id === (item.productId || item.id));
                    if (productData) {
                        const mainImage = (productData.imageUrls && productData.imageUrls.length > 0)
                            ? productData.imageUrls[0]
                            : productData.imageUrl;
                        if (mainImage && !orderImages.includes(mainImage)) {
                            orderImages.push(mainImage);
                        }
                    }
                }


                let fields = [];


                fields.push({
                    name: '👤 معلومات العميل',
                    value: `**الاسم:** ${fullName}\n**رقم الهاتف:** ${fullPhoneNumber}\n**المحافظة:** ${governorate}\n**القضاء/المدينة:** ${district}`,
                    inline: false
                });


                if (notes) {
                    fields.push({
                        name: '📝 ملاحظات',
                        value: notes,
                        inline: false
                    });
                }


                let userDetails = `**UID:** ${userId}`;
                if (currentUserProfile) {
                    userDetails += `\n**الاسم المسجل:** ${currentUserProfile.fullName}\n**الهاتف المسجل:** ${currentUserProfile.phoneNumber}`;
                }
                fields.push({
                    name: '🆔 تفاصيل الحساب',
                    value: userDetails,
                    inline: false
                });


                let productsList = '';
                cartToProcess.forEach((item, index) => {
                    const productData = productsData.find(p => p.id === (item.productId || item.id));
                    const freeDeliveryText = (productData && productData.freeDelivery) ? ' (توصيل مجاني)' : '';
                    const selectedColor = window.getSelectedProductColor(item.productId || item.id);
                    const colorText = selectedColor ? `\n🎨 اللون: ${selectedColor}` : '';
                    productsList += `${index + 1}. **${item.name}** (${item.quantity}x)${freeDeliveryText}${colorText}\n💰 ${Math.round(item.price).toLocaleString('en-US')} د.ع\n`;
                });
                fields.push({
                    name: '🛒 المنتجات',
                    value: productsList,
                    inline: false
                });


                let financialDetails = `**المجموع الفرعي:** ${Math.round(cartTotalForBot).toLocaleString('en-US')} د.ع\n`;
                if (hasNonFreeDeliveryItems) {
                    financialDetails += `**التوصيل:** 5,000 د.ع\n`;
                } else {
                    financialDetails += `**التوصيل:** مجاني\n`;
                }
                financialDetails += `**المجموع الكلي:** ${Math.round(cartTotalForBot + deliveryFee).toLocaleString('en-US')} د.ع`;

                fields.push({
                    name: '💵 الملخص المالي',
                    value: financialDetails,
                    inline: false
                });


                const confirmUrl = `${window.location.origin}/#confirm-${orderDocRef.id}`;
                fields.push({
                    name: '🔗 تأكيد الطلب',
                    value: `[اضغط هنا لتأكيد الطلب](${confirmUrl})`,
                    inline: false
                });


                const embed = {
                    title: '✅ طلب جديد!',
                    color: 5763719,
                    timestamp: new Date().toISOString(),
                    fields: fields,
                    footer: {
                        text: `Order ID: ${shortOrderId}`
                    }
                };


                if (orderImages.length > 0) {
                    embed.image = {
                        url: orderImages[0]
                    };
                }


                // 1. Start Animation
                const confirmBtn = document.getElementById('confirm-order-btn');
                if (confirmBtn) confirmBtn.classList.add('animate');

                // 2. Send Webhook
                try {
                    await sendDiscordWebhook(`🛒 **طلب جديد من ${fullName}**\n\n<@1385265431354540204>`, [embed]);

                    if (orderImages.length > 1) {
                        for (let i = 1; i < Math.min(orderImages.length, 5); i++) {
                            const imageEmbed = {
                                image: {
                                    url: orderImages[i]
                                },
                                color: 5763719
                            };
                            await sendDiscordWebhook('', [imageEmbed]);
                        }
                    }
                } catch (webhookError) {
                    console.error("Webhook failed:", webhookError);
                    alertUserMessage('تم حفظ الطلب، لكن فشل إرسال الإشعار.', 'warning');
                }

                // 3. Wait for animation to show "Success" state (approx 8s total)
                await new Promise(resolve => setTimeout(resolve, 8000));

                alertUserMessage('تم تأكيد الطلب بنجاح! سيتم التواصل معك قريباً.', 'success');

                // 4. Cleanup UI
                if (uiElements.checkoutModal) uiElements.checkoutModal.classList.add('hidden');
                if (uiElements.shoppingCartModal) uiElements.shoppingCartModal.classList.add('hidden');

                // Reset animation class
                if (confirmBtn) setTimeout(() => confirmBtn.classList.remove('animate'), 1000);

                // 5. Clear Cart
                orderCartData = [];
                const shouldClearCart = cartToProcess.length > 0 && cartToProcess[0].id !== undefined;

                if (shouldClearCart) {
                    try {
                        console.log("Attempting to clear cart...");
                        const cartItemsRef = collection(db, `users/${userId}/cart`);
                        const cartSnapshot = await getDocs(cartItemsRef);

                        if (!cartSnapshot.empty) {
                            const deleteCartPromises = [];
                            cartSnapshot.forEach(doc => {
                                deleteCartPromises.push(deleteDoc(doc.ref));
                            });
                            await Promise.all(deleteCartPromises);
                            console.log("Cart cleared successfully.");
                        }

                        currentCart = [];
                        displayCart();
                    } catch (cartError) {
                        console.error("Error clearing cart:", cartError);
                    }
                }

            } catch (error) {
                console.error("Error confirming order:", error);
                const confirmBtn = document.getElementById('confirm-order-btn');
                if (confirmBtn) confirmBtn.classList.remove('animate');
                alertUserMessage(`فشل تأكيد الطلب: ${error.message}`, 'error');
            }
        });
    }


    if (uiElements.bottomAddProductBtn) {
        uiElements.bottomAddProductBtn.addEventListener('click', () => {
            if (isAdmin) {
                if (uiElements.addProductModal) uiElements.addProductModal.classList.remove('hidden');
                if (uiElements.addProductForm) uiElements.addProductForm.reset();
                if (uiElements.addProductMessage) uiElements.addProductMessage.textContent = '';
                if (uiElements.productCategorySelect) {
                    uiElements.productCategorySelect.innerHTML = '<option value="">اختر تصنيفًا</option>';
                    categoriesData.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = cat.name;
                        uiElements.productCategorySelect.appendChild(option);
                    });
                }
            } else {
                alertUserMessage("ليس لديك صلاحية إضافة منتجات.");
            }
        });
    }


    if (uiElements.addProductForm) {
        uiElements.addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAdmin) {
                alertUserMessage("ليس لديك صلاحية إضافة منتجات.");
                return;
            }
            const name = uiElements.productNameInput.value.trim();
            const description = uiElements.productDescriptionInput.value.trim();
            const price = parseFloat(uiElements.productPriceInput.value);
            const category = uiElements.productCategorySelect.value;
            const freeDelivery = document.getElementById('product-free-delivery').checked;
            const removeWhiteBackground = document.getElementById('product-remove-white-bg').checked;
            const availability = document.getElementById('product-availability').value;


            const imageUrls = [];
            for (let i = 1; i <= 5; i++) {
                const imageInput = document.getElementById(`product-image-url-${i}`);
                if (imageInput && imageInput.value.trim()) {
                    imageUrls.push(imageInput.value.trim());
                }
            }


            if (imageUrls.length === 0) {
                alertUserMessage('الرجاء رفع صورة واحدة على الأقل للمنتج.', 'error');
                return;
            }

            if (!name || !description || isNaN(price) || price <= 0 || !category) {
                alertUserMessage('الرجاء تعبئة جميع الحقول بشكل صحيح.', 'error');
                return;
            }

            try {
                const colors = window.getProductColorsForSave();

                const productsColRef = collection(db, `products`);
                const docRef = await addDoc(productsColRef, {
                    name,
                    description,
                    price,
                    imageUrls,
                    imageUrl: imageUrls[0],
                    category,
                    freeDelivery,
                    removeWhiteBackground,
                    availability: availability || '',
                    sku: generateProductSKU(),
                    createdAt: new Date().toISOString(),
                    colors: colors
                });
                console.log("Product successfully added to Firestore with ID:", docRef.id);
                alertUserMessage('تم إضافة المنتج بنجاح!', 'success');


                if (uiElements.addProductForm) uiElements.addProductForm.reset();


                for (let i = 1; i <= 5; i++) {
                    window.clearProductImage(i);
                }

                setTimeout(() => {
                    if (uiElements.addProductModal) uiElements.addProductModal.classList.add('hidden');
                }, 1500);
            } catch (error) {
                console.error("Error adding product to Firestore: ", error);
                alertUserMessage(`فشل إضافة المنتج: ${error.message}`, 'error');
            }
        });
    }


    for (let i = 1; i <= 5; i++) {
        const fileInput = document.getElementById(`product-image-file-${i}`);
        if (fileInput) {
            fileInput.addEventListener('change', async () => {
                await handleProductImageUpload(i);
            });
        }
    }


    if (uiElements.bottomAddCategoryBtn) {
        uiElements.bottomAddCategoryBtn.addEventListener('click', () => {
            if (isAdmin) {
                if (uiElements.addCategoryModal) uiElements.addCategoryModal.classList.remove('hidden');
                if (uiElements.newCategoryNameInput) uiElements.newCategoryNameInput.value = '';
                if (uiElements.addCategoryMessage) uiElements.addCategoryMessage.textContent = '';
            } else {
                alertUserMessage("ليس لديك صلاحية إضافة تصنيفات.");
            }
        });
    }


    const manageDevelopersBtn = document.getElementById('manage-developers-btn');
    if (manageDevelopersBtn) {
        manageDevelopersBtn.addEventListener('click', () => {
            if (userId === MAIN_DEVELOPER_UID) {
                const manageDevelopersModal = document.getElementById('manage-developers-modal');
                if (manageDevelopersModal) {
                    manageDevelopersModal.classList.remove('hidden');
                    displayDevelopersList();
                }
            } else {
                alertUserMessage("فقط المطور الرئيسي يمكنه إدارة المطورين.", 'error');
            }
        });
    }


    const addDeveloperForm = document.getElementById('add-developer-form');
    if (addDeveloperForm) {
        addDeveloperForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newDeveloperUID = document.getElementById('new-developer-uid').value.trim();
            await addDeveloper(newDeveloperUID);
            document.getElementById('new-developer-uid').value = '';
        });
    }


    const manageFeaturedBtn = document.getElementById('manage-featured-btn');
    if (manageFeaturedBtn) {
        manageFeaturedBtn.addEventListener('click', openManageFeaturedModal);
    }

    const saveFeaturedBtn = document.getElementById('save-featured-btn');
    if (saveFeaturedBtn) {
        saveFeaturedBtn.addEventListener('click', saveFeaturedProducts);
    }

    const featuredSearchInput = document.getElementById('featured-search-input');
    if (featuredSearchInput) {
        featuredSearchInput.addEventListener('input', (e) => {
            displayAvailableProducts(e.target.value);
        });
    }


    if (uiElements.editCategoryForm) {
        uiElements.editCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAdmin) {
                alertUserMessage("ليس لديك صلاحية تعديل التصنيفات.");
                return;
            }
            const categoryId = uiElements.editCategoryIdInput.value;
            const newName = uiElements.editCategoryNameInput.value.trim();

            if (!newName) {
                alertUserMessage("الرجاء إدخال اسم التصنيف.", 'error');
                return;
            }

            await updateCategory(categoryId, newName);
            setTimeout(() => {
                if (uiElements.editCategoryModal) uiElements.editCategoryModal.classList.add('hidden');
            }, 1500);
        });
    }


    if (uiElements.addCategoryForm) {
        uiElements.addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAdmin) {
                alertUserMessage("ليس لديك صلاحية إضافة تصنيفات.");
                return;
            }
            const categoryName = uiElements.newCategoryNameInput.value.trim();
            if (!categoryName) {
                alertUserMessage("الرجاء إدخال اسم التصنيف.", 'error');
                return;
            }
            try {
                const categoriesColRef = collection(db, `categories`);
                await addDoc(categoriesColRef, {
                    name: categoryName,
                    createdAt: new Date().toISOString()
                });
                alertUserMessage("تم إضافة التصنيف بنجاح!", 'success');
                if (uiElements.addCategoryForm) uiElements.addCategoryForm.reset();
                setTimeout(() => {
                    if (uiElements.addCategoryModal) uiElements.addCategoryModal.classList.add('hidden');
                }, 1500);
            } catch (error) {
                console.error("Error adding category:", error);
                alertUserMessage(`فشل إضافة التصنيف: ${error.message}`, 'error');
            }
        });
    }


    if (uiElements.editProductForm) {
        uiElements.editProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAdmin) {
                alertUserMessage("ليس لديك صلاحية تعديل المنتجات.");
                return;
            }
            const productId = uiElements.editProductIdInput.value;
            const name = uiElements.editProductNameInput.value.trim();
            const description = uiElements.editProductDescriptionInput.value.trim();
            const price = parseFloat(uiElements.editProductPriceInput.value);
            const category = uiElements.editProductCategorySelect.value;
            const freeDelivery = document.getElementById('edit-product-free-delivery').checked;
            const removeWhiteBackground = document.getElementById('edit-product-remove-white-bg').checked;
            const availability = document.getElementById('edit-product-availability').value;


            const hasDiscount = document.getElementById('edit-product-has-discount').checked;
            const discountPriceInput = document.getElementById('edit-product-discount-price');
            let discountPrice = null;

            if (hasDiscount && discountPriceInput && discountPriceInput.value) {
                discountPrice = parseFloat(discountPriceInput.value);
                if (isNaN(discountPrice) || discountPrice >= price) {
                    alertUserMessage('سعر الخصم يجب أن يكون أقل من السعر الأصلي.', 'error');
                    return;
                }
            }


            const imageUrls = [];
            for (let i = 1; i <= 5; i++) {
                const imageInput = document.getElementById(`edit-product-image-url-${i}`);
                if (imageInput && imageInput.value.trim()) {
                    imageUrls.push(imageInput.value.trim());
                }
            }

            if (!productId || !name || !description || isNaN(price) || price <= 0 || imageUrls.length === 0 || !category) {
                alertUserMessage('الرجاء تعبئة جميع الحقول بشكل صحيح وإدخال رابط الصورة الرئيسية على الأقل.', 'error');
                return;
            }

            try {
                const productDocRef = doc(db, `products`, productId);
                const updateData = {
                    name,
                    description,
                    price,
                    imageUrls,
                    imageUrl: imageUrls[0],
                    category,
                    freeDelivery,
                    removeWhiteBackground,
                    availability: availability || '',
                    colors: window.getEditProductColorsForSave()
                };


                if (hasDiscount && discountPrice !== null) {
                    updateData.discountPrice = discountPrice;
                } else {
                    updateData.discountPrice = null;
                }

                await updateDoc(productDocRef, updateData);
                alertUserMessage('تم تعديل المنتج بنجاح!', 'success');
                setTimeout(() => {
                    if (uiElements.editProductModal) uiElements.editProductModal.classList.add('hidden');
                }, 1500);
            } catch (error) {
                console.error("Error updating product:", error);
                alertUserMessage(`فشل تعديل المنتج: ${error.message}`, 'error');
            }
        });
    }


    if (uiElements.bottomReviewsBtn) {
        uiElements.bottomReviewsBtn.addEventListener('click', () => {
            if (uiElements.reviewsModal) uiElements.reviewsModal.classList.remove('hidden');
            displayReviews(reviewsData);
        });
    }
    if (uiElements.addReviewBtn) {
        uiElements.addReviewBtn.addEventListener('click', () => {
            if (userId && currentUserProfile) {
                if (uiElements.addReviewModal) uiElements.addReviewModal.classList.remove('hidden');
                if (uiElements.addReviewForm) uiElements.addReviewForm.reset();
                if (uiElements.reviewRatingDisplay) uiElements.reviewRatingDisplay.textContent = '5';
                if (uiElements.reviewRatingInput) uiElements.reviewRatingInput.value = '5';
            } else {
                alertUserMessage("الرجاء تسجيل الدخول أولاً لإضافة تقييم.", 'warning');
            }
        });
    }
    if (uiElements.reviewRatingInput) {
        uiElements.reviewRatingInput.addEventListener('input', () => {
            if (uiElements.reviewRatingDisplay) uiElements.reviewRatingDisplay.textContent = uiElements.reviewRatingInput.value;
        });
    }

    if (uiElements.addReviewForm) {
        uiElements.addReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!userId) {
                alertUserMessage("الرجاء تسجيل الدخول لإضافة تقييم.", 'warning');
                return;
            }
            const reviewText = uiElements.reviewTextInput.value.trim();
            const reviewRating = parseInt(uiElements.reviewRatingInput.value);

            if (!reviewText || isNaN(reviewRating) || reviewRating < 1 || reviewRating > 5) {
                alertUserMessage('الرجاء كتابة تقييم وتحديد تقييم من 1 إلى 5 نجوم.', 'error');
                return;
            }

            try {
                await addDoc(collection(db, `reviews`), {
                    userId: userId,
                    userName: currentUserProfile ? currentUserProfile.fullName : 'مستخدم',
                    rating: reviewRating,
                    text: reviewText,
                    createdAt: new Date().toISOString()
                });
                alertUserMessage("تم إضافة تقييمك بنجاح!", 'success');
                if (uiElements.addReviewForm) uiElements.addReviewForm.reset();
                if (uiElements.reviewRatingInput) uiElements.reviewRatingInput.value = '5';
                if (uiElements.reviewRatingDisplay) uiElements.reviewRatingDisplay.textContent = '5';
                setTimeout(() => {
                    if (uiElements.addReviewModal) uiElements.addReviewModal.classList.add('hidden');
                }, 1500);
            } catch (error) {
                console.error("Error adding review:", error);
                if (error.code === 'permission-denied') {
                    alertUserMessage("خطأ في الأذونات: يرجى التحقق من قواعد أمان Firebase. تأكد من أن المستخدمين المسجلين يمكنهم إضافة التقييمات.", 'error');
                } else {
                    alertUserMessage(`فشل إضافة التقييم: ${error.message}`, 'error');
                }
            }
        });
    }


    const performSearch = () => {
        const query = uiElements.mainSearchInput.value.toLowerCase().trim();
        const filtered = productsData.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        displayProducts(filtered);
        document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (uiElements.mainSearchInput) {
        uiElements.mainSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }


    if (uiElements.bottomCategoriesBtn) {
        uiElements.bottomCategoriesBtn.addEventListener('click', () => {
            if (uiElements.categoriesDropdown) {
                uiElements.categoriesDropdown.classList.toggle('hidden');
            }
        });
    }


    if (uiElements.bottomHomeBtn) {
        uiElements.bottomHomeBtn.addEventListener('click', () => {
            document.getElementById('top').scrollIntoView({ behavior: 'smooth' });


            const bodyElement = document.body;
            bodyElement.classList.remove('mousepads-category');

            displayProducts(productsData);
        });
    }


    const bottomOrdersBtn = document.getElementById('bottom-orders-btn');
    const ordersTrackingModal = document.getElementById('orders-tracking-modal');
    const ordersList = document.getElementById('orders-list');

    if (bottomOrdersBtn) {
        bottomOrdersBtn.addEventListener('click', async () => {
            if (!userId) {
                alertUserMessage('الرجاء تسجيل الدخول لمتابعة طلباتك.', 'warning');
                return;
            }

            if (ordersTrackingModal) {
                await displayOrders();
                ordersTrackingModal.classList.remove('hidden');
            }
        });
    }


    const displayOrders = async () => {
        if (!ordersList || !userId) return;


        if (ordersUnsubscribe) {
            ordersUnsubscribe();
            ordersUnsubscribe = null;
        }

        try {
            const ordersRef = collection(db, `users/${userId}/orders`);


            if (ordersUnsubscribe) {
                ordersUnsubscribe();
            }


            ordersUnsubscribe = onSnapshot(ordersRef, (ordersSnapshot) => {
                if (ordersSnapshot.empty) {
                    ordersList.innerHTML = '<p class="text-center text-white">لا توجد طلبات حالياً</p>';
                    return;
                }

                ordersList.innerHTML = '';
                const orders = [];
                ordersSnapshot.forEach(doc => {
                    orders.push({ id: doc.id, ...doc.data() });
                });


                orders.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA;
                });

                orders.forEach(order => {
                    const orderDate = new Date(order.createdAt);
                    const statusText = getStatusText(order.status);
                    const statusColor = getStatusColor(order.status);

                    let itemsHtml = '';
                    if (order.items && order.items.length > 0) {
                        order.items.forEach((item, index) => {
                            itemsHtml += `<p class="text-sm">${index + 1}. ${item.name} (${item.quantity}x) - ${Math.round(item.price * item.quantity).toLocaleString('en-US')} د.ع</p>`;
                        });
                    }

                    const orderHtml = `
                        <div class="bg-purple-800 p-4 rounded-lg mb-4 border border-purple-700">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="text-lg font-bold text-white">طلب #${order.orderId ? order.orderId.substring(6, 15) : order.id.substring(0, 8)}</h4>
                                <span class="px-3 py-1 rounded text-sm font-semibold" style="background-color: ${statusColor}; color: white;">${statusText}</span>
                            </div>
                            <p class="text-gray-300 text-sm mb-2">التاريخ: ${orderDate.toLocaleDateString('ar-EG')} ${orderDate.toLocaleTimeString('ar-EG')}</p>
                            <p class="text-gray-300 text-sm mb-2">المحافظة: ${order.governorate || 'غير محدد'}</p>
                            <p class="text-gray-300 text-sm mb-3">القضاء/المدينة: ${order.district || 'غير محدد'}</p>
                            <div class="border-t border-purple-700 pt-2 mb-2">
                                <p class="text-white font-semibold mb-1">المنتجات:</p>
                                ${itemsHtml || '<p class="text-sm text-white">لا توجد منتجات</p>'}
                            </div>
                            <div class="border-t border-purple-700 pt-2">
                                <p class="text-green-400 font-bold text-lg">المجموع: ${Math.round(order.total || 0).toLocaleString('en-US')} د.ع</p>
                            </div>
                        </div>
                    `;
                    ordersList.insertAdjacentHTML('beforeend', orderHtml);
                });
            }, (error) => {
                console.error("Error fetching orders:", error);
                ordersList.innerHTML = '<p class="text-center text-red-400">حدث خطأ في جلب الطلبات</p>';
            });
        } catch (error) {
            console.error("Error setting up orders listener:", error);
            ordersList.innerHTML = '<p class="text-center text-red-400">حدث خطأ في جلب الطلبات</p>';
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'received': 'تم استلام الطلب',
            'confirmed': 'تم تأكيد الطلب',
            'reviewed': 'تم مراجعة طلبك وسيصلك الطلب خلال وقت محدد'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'received': '#3b82f6',
            'confirmed': '#10b981',
            'reviewed': '#8b5cf6'
        };
        return colorMap[status] || '#6b7280';
    };


    const hasDiscountCheckbox = document.getElementById('edit-product-has-discount');
    const discountContainer = document.getElementById('edit-product-discount-container');

    if (hasDiscountCheckbox && discountContainer) {
        hasDiscountCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                discountContainer.classList.remove('hidden');
            } else {
                discountContainer.classList.add('hidden');
                const discountPriceInput = document.getElementById('edit-product-discount-price');
                if (discountPriceInput) discountPriceInput.value = '';
            }
        });
    }
};


const updateOrderStatus = async (orderId, userId, newStatus) => {
    try {
        const ordersRef = collection(db, `users/${userId}/orders`);
        const ordersSnapshot = await getDocs(ordersRef);

        let orderDocId = null;
        ordersSnapshot.forEach(doc => {
            if (doc.data().orderId === orderId) {
                orderDocId = doc.id;
            }
        });

        if (orderDocId) {
            const orderRef = doc(db, `users/${userId}/orders`, orderDocId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            console.log(`Order ${orderId} status updated to ${newStatus}`);
            return true;
        } else {
            console.error(`Order ${orderId} not found`);
            return false;
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        return false;
    }
};


const handleTelegramCallback = async (callbackQuery) => {
    try {
        const callbackData = callbackQuery.data;
        const messageId = callbackQuery.message?.message_id;
        const chatId = callbackQuery.message?.chat?.id;
        const originalMessageText = callbackQuery.message?.text || '';

        if (!callbackData || !callbackData.startsWith('rev_')) {
            return { success: false, error: 'Invalid callback data' };
        }


        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQuery.id,
                text: 'جاري مراجعة الطلب...'
            })
        });


        const usersColRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersColRef);

        for (const userDoc of usersSnapshot.docs) {
            const userUid = userDoc.id;
            const ordersRef = collection(db, `users/${userUid}/orders`);
            const ordersSnapshot = await getDocs(ordersRef);

            for (const orderDoc of ordersSnapshot.docs) {
                const orderData = orderDoc.data();

                if (orderData.callbackData === callbackData) {

                    const orderDocId = orderDoc.id;
                    const orderRef = doc(db, `users/${userUid}/orders`, orderDocId);
                    await updateDoc(orderRef, {
                        status: 'reviewed',
                        updatedAt: new Date().toISOString()
                    });


                    const updatedMessage = originalMessageText + '\n\n✅ *تم مراجعة طلبك وسيصلك الطلب خلال وقت محدد*';

                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId || TELEGRAM_CHAT_ID,
                            message_id: messageId,
                            text: updatedMessage,
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


                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId || TELEGRAM_CHAT_ID,
                            text: `✅ تم مراجعة الطلب ${orderData.orderId} بنجاح!\n\n✅ تم تحديث حالة الطلب في الموقع إلى: *تم مراجعة طلبك وسيصلك الطلب خلال وقت محدد*`,
                            parse_mode: 'Markdown'
                        })
                    });

                    return { success: true };
                }
            }
        }

        return { success: false, error: 'Order not found' };
    } catch (error) {
        console.error("Error handling telegram callback:", error);
        return { success: false, error: error.message };
    }
};


window.removeDeveloper = removeDeveloper;
window.updateOrderStatus = updateOrderStatus;
window.handleTelegramCallback = handleTelegramCallback;


window.onload = async () => {

    await new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });


    uiElements = {

        loginProfileBtn: getUiElement('login-profile-btn'),
        loginProfileText: getUiElement('login-profile-text'),
        headerCartBtn: getUiElement('header-cart-btn'),
        headerCartCount: getUiElement('header-cart-count'),
        mainSearchInput: getUiElement('main-search-input'),


        productsContainer: getUiElement('products-container'),


        loginModal: getUiElement('login-modal'),
        loginForm: getUiElement('login-form'),
        fullNameInput: getUiElement('full-name'),
        phoneNumberInput: getUiElement('phone-number'),
        loginMessage: getUiElement('login-message'),

        profileDetailsModal: getUiElement('profile-details-modal'),
        profileDetailsImage: getUiElement('profile-details-image'),
        profileDetailsName: getUiElement('profile-details-name'),
        profileDetailsPhone: getUiElement('profile-details-phone'),
        profileDetailsRegisteredDate: getUiElement('profile-details-registered-date'),
        profileDetailsLogoutBtn: getUiElement('profile-details-logout-btn'),
        profileDetailsLoginBtn: getUiElement('profile-details-login-btn'),
        developerStatus: getUiElement('developer-status'),
        userCountDisplay: getUiElement('user-count-display'),
        userCount: getUiElement('user-count'),

        shoppingCartModal: getUiElement('shopping-cart-modal'),
        cartItemsContainer: getUiElement('cart-items'),
        cartTotalElement: getUiElement('cart-total'),
        cartSummaryDiv: getUiElement('cart-summary'),
        checkoutButton: getUiElement('checkout-btn'),

        productDetailModal: getUiElement('product-detail-modal'),
        productDetailName: getUiElement('product-detail-name'),

        productDetailCategory: getUiElement('product-detail-category'),
        productDetailDescription: getUiElement('product-detail-description'),
        productDetailPrice: getUiElement('product-detail-price'),
        addToCartDetailBtn: getUiElement('add-to-cart-detail-btn'),
        buyNowDetailBtn: getUiElement('buy-now-detail-btn'),

        checkoutModal: getUiElement('checkout-modal'),
        checkoutForm: getUiElement('checkout-form'),
        checkoutNameInput: getUiElement('checkout-name'),
        checkoutPhoneInput: getUiElement('checkout-phone'),
        checkoutGovernorateSelect: getUiElement('checkout-governorate'),
        checkoutDistrictInput: getUiElement('checkout-district'),
        checkoutNotesTextarea: getUiElement('checkout-notes'),
        checkoutProductsList: getUiElement('checkout-products-list'),
        checkoutGrandTotal: getUiElement('checkout-grand-total'),
        confirmOrderBtn: getUiElement('confirm-order-btn'),
        checkoutMessage: getUiElement('checkout-message'),

        editCategoryModal: getUiElement('edit-category-modal'),
        editCategoryForm: getUiElement('edit-category-form'),
        editCategoryIdInput: getUiElement('edit-category-id'),
        editCategoryNameInput: getUiElement('edit-category-name'),
        editCategoryMessage: getUiElement('edit-category-message'),

        addCategoryModal: getUiElement('add-category-modal'),
        newCategoryNameInput: getUiElement('new-category-name'),
        addCategoryForm: getUiElement('add-category-form'),
        addCategoryMessage: getUiElement('add-category-message'),

        addProductModal: getUiElement('add-product-modal'),
        addProductForm: getUiElement('add-product-form'),
        productNameInput: getUiElement('product-name'),
        productDescriptionInput: getUiElement('product-description'),
        productPriceInput: getUiElement('product-price'),

        productCategorySelect: getUiElement('product-category'),
        addProductMessage: getUiElement('add-product-message'),

        editProductModal: getUiElement('edit-product-modal'),
        editProductForm: getUiElement('edit-product-form'),
        editProductIdInput: getUiElement('edit-product-id'),
        editProductNameInput: getUiElement('edit-product-name'),
        editProductDescriptionInput: getUiElement('edit-product-description'),
        editProductPriceInput: getUiElement('edit-product-price'),

        editProductCategorySelect: getUiElement('edit-product-category'),
        editProductMessage: getUiElement('edit-product-message'),

        reviewsModal: getUiElement('reviews-modal'),
        reviewsList: getUiElement('reviews-list'),
        addReviewBtn: getUiElement('add-review-btn'),

        addReviewModal: getUiElement('add-review-modal'),
        addReviewForm: getUiElement('add-review-form'),
        reviewTextInput: getUiElement('review-text'),
        reviewRatingInput: getUiElement('review-rating'),
        reviewRatingDisplay: getUiElement('review-rating-display'),
        addReviewMessage: getUiElement('add-review-message'),


        bottomHomeBtn: getUiElement('bottom-home-btn'),
        bottomCategoriesBtn: getUiElement('bottom-categories-btn'),
        categoriesDropdown: getUiElement('categories-dropdown'),
        bottomReviewsBtn: getUiElement('bottom-reviews-btn'),
        developerButtons: getUiElement('developer-buttons'),
        bottomAddCategoryBtn: getUiElement('bottom-add-category-btn'),
        bottomAddProductBtn: getUiElement('bottom-add-product-btn'),
        manageDevelopersBtn: getUiElement('manage-developers-btn'),


        messageBox: getUiElement('message-box'),
        messageBoxText: getUiElement('message-box-text'),
        messageBoxConfirmBtn: getUiElement('message-box-confirm'),
        messageBoxCancelBtn: getUiElement('message-box-cancel'),
    };


    if (uiElements.checkoutGovernorateSelect) {
        iraqiGovernorates.forEach(gov => {
            const option = document.createElement('option');
            option.value = gov;
            option.textContent = gov;
            uiElements.checkoutGovernorateSelect.appendChild(option);
        });
    }


    for (let i = 1; i <= 5; i++) {
        const fileInput = document.getElementById(`product-image-file-${i}`);
        if (fileInput) {
            fileInput.addEventListener('change', () => handleProductImageUpload(i));
        }


        const editFileInput = document.getElementById(`edit-product-image-file-${i}`);
        if (editFileInput) {
            editFileInput.addEventListener('change', () => handleProductImageUpload(i));
        }
    }


    setupEventListeners();
    await initializeFirebase();
};


window.addEventListener('load', async () => {

    await firebaseReadyPromise;

    const hash = window.location.hash;
    if (hash.startsWith('#confirm-')) {
        const orderDocId = hash.replace('#confirm-', '');


        await new Promise(resolve => setTimeout(resolve, 1000));


        if (!isAdmin) {
            alertUserMessage('ليس لديك صلاحية لتأكيد الطلبات.', 'error');
            window.location.hash = '';
            return;
        }


        const confirmed = await showConfirmationMessage('هل تريد تأكيد هذا الطلب؟');

        if (confirmed) {
            try {

                const usersColRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersColRef);

                let orderFound = false;
                let orderUserId = null;

                for (const userDoc of usersSnapshot.docs) {
                    try {
                        const orderRef = doc(db, `users/${userDoc.id}/orders`, orderDocId);
                        const orderSnap = await getDoc(orderRef);

                        if (orderSnap.exists()) {
                            const orderData = orderSnap.data();


                            if (orderData.status === 'confirmed') {
                                alertUserMessage('هذا الطلب تم تأكيده مسبقاً!', 'warning');
                                window.location.hash = '';
                                return;
                            }


                            await updateDoc(orderRef, {
                                status: 'confirmed',
                                confirmedAt: new Date().toISOString(),
                                confirmedBy: userId,
                                updatedAt: new Date().toISOString()
                            });

                            orderFound = true;
                            orderUserId = userDoc.id;

                            alertUserMessage('✅ تم تأكيد الطلب بنجاح!', 'success');


                            window.location.hash = '';


                            setTimeout(() => {
                                if (uiElements.ordersModal && !uiElements.ordersModal.classList.contains('hidden')) {
                                    displayOrders();
                                }
                            }, 1000);

                            break;
                        }
                    } catch (orderError) {
                        continue;
                    }
                }

                if (!orderFound) {
                    alertUserMessage('لم يتم العثور على الطلب. قد يكون تم حذفه.', 'error');
                    window.location.hash = '';
                }

            } catch (error) {
                console.error('Error confirming order:', error);
                alertUserMessage(`فشل تأكيد الطلب: ${error.message}`, 'error');
                window.location.hash = '';
            }
        } else {

            window.location.hash = '';
        }
    }
});

// --- Helper Functions for Share & Lightbox ---

window.copyProductLink = (product) => {
    // Construct URL with hash for the product
    const url = `${window.location.origin}${window.location.pathname}#product-${product.sku || product.id}`;

    // Get image URL for preview
    const mainImage = (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl;
    const imageUrl = getProxiedImageUrl(mainImage);

    // Combine for clipboard: Link + Image URL (to force preview on some platforms)
    // We put the Main URL first so it's the primary link, and Image URL on a new line.
    const textToCopy = imageUrl ? `${url}\n${imageUrl}` : url;

    // Fallback copy method
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alertUserMessage('تم نسخ رابط المنتج بنجاح!', 'success');
        }).catch(err => {
            console.error('Copy failed', err);
            prompt('اضغط Ctrl+C لنسخ الرابط:', textToCopy);
        });
    } else {
        prompt('اضغط Ctrl+C لنسخ الرابط:', textToCopy);
    }
};

let currentLightboxImages = [];
let currentLightboxIndex = 0;

window.openLightbox = (images, startIndex = 0) => {
    currentLightboxImages = images;
    currentLightboxIndex = startIndex;
    const modal = document.getElementById('image-lightbox-modal');
    if (modal) {
        modal.classList.remove('hidden');
        updateLightboxImage();
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
};

const updateLightboxImage = () => {
    const img = document.getElementById('lightbox-image');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const counter = document.getElementById('lightbox-counter');

    if (img && currentLightboxImages[currentLightboxIndex]) {
        img.src = currentLightboxImages[currentLightboxIndex];
    }

    if (currentLightboxImages.length > 1) {
        if (prevBtn) prevBtn.classList.remove('hidden');
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxImages.length}`;
    } else {
        if (prevBtn) prevBtn.classList.add('hidden');
        if (nextBtn) nextBtn.classList.add('hidden');
        if (counter) counter.textContent = '';
    }
};

window.closeLightbox = () => {
    const modal = document.getElementById('image-lightbox-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }
};

// Navigation handlers
window.lightboxNext = (e) => {
    if (e) e.stopPropagation();
    if (currentLightboxImages.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
    updateLightboxImage();
};

window.lightboxPrev = (e) => {
    if (e) e.stopPropagation();
    if (currentLightboxImages.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
    updateLightboxImage();
};

// Bind to global scope if needed for HTML attributes (though we prefer listeners)
// Ensure close button works
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) closeBtn.onclick = window.closeLightbox;

    const nextBtn = document.getElementById('lightbox-next');
    if (nextBtn) nextBtn.onclick = window.lightboxNext;

    const prevBtn = document.getElementById('lightbox-prev');
    if (prevBtn) prevBtn.onclick = window.lightboxPrev;

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('image-lightbox-modal');
        if (modal && !modal.classList.contains('hidden')) {
            if (e.key === 'Escape') window.closeLightbox();
            if (e.key === 'ArrowRight') window.lightboxNext();
            if (e.key === 'ArrowLeft') window.lightboxPrev();
        }
    });

    // Share button in normal details modal (if used)
    const shareDetailBtn = document.getElementById('share-product-detail-btn');
    if (shareDetailBtn) {
        // Note: we need the 'product' object here. 
        // But the modal is static in index.html, so we can't easily bind specific product data here 
        // unless openProductDetailPage uses that modal.
        // Since openProductDetailPage creates its own view, this might be redundant for that view,
        // but good if the static modal is used elsewhere.
    }
});


// --- AI Description Generator ---
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-description-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const nameInput = document.getElementById('product-name');
            const descInput = document.getElementById('product-description');

            if (!nameInput || !nameInput.value.trim()) {
                alertUserMessage('⚠️ يرجى كتابة اسم المنتج أولاً لتوليد الوصف المناسب.', 'warning');
                if (nameInput) nameInput.focus();
                return;
            }

            const productName = nameInput.value.trim();
            const originalBtnContent = generateBtn.innerHTML;

            // UI Loading State
            generateBtn.innerHTML = `
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التوليد...
            `;
            generateBtn.disabled = true;
            generateBtn.classList.add('cursor-not-allowed', 'opacity-75');

            try {
                // Call Gemini API
                // IPO: Input (Product Name) -> Process (Gemini API) -> Output (Description)
                const generatedText = await fetchGeminiDescription(productName);

                // Typewriter Effect
                if (descInput) {
                    descInput.value = ''; // Clear previous text
                    await typeWriter(descInput, generatedText);
                    descInput.dispatchEvent(new Event('input')); // Trigger autosize/validation
                }

                alertUserMessage('✨ تم توليد الوصف بنجاح!', 'success');

            } catch (error) {
                console.error("AI Generation Error:", error);
                const msg = error.message.includes('الحد المسموح') ? error.message : 'فشل توليد الوصف. يرجى التأكد من مفتاح API أو المحاولة لاحقاً.';
                alertUserMessage(msg, 'error');
            } finally {
                // Restore Button State
                generateBtn.innerHTML = originalBtnContent;
                generateBtn.disabled = false;
                generateBtn.classList.remove('cursor-not-allowed', 'opacity-75');
            }
        });
    }
});

// Helper: Call Gemini API
async function fetchGeminiDescription(productName) {
    // IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual key.
    // WARNING: Exposing API keys in client-side code is risky. ideally use a backend proxy.
    const API_KEY = 'AIzaSyC0Vdf8-s1S2sorfmkn7YHZGcCJekBC2pE';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const prompt = `اكتب وصفًا تسويقيًا جذابًا ومختصرًا (حوالي 3-4 جمل) للمنتج التالي باللغة العربية: ${productName}. ركز على المميزات والجودة.`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('API_QUOTA_EXCEEDED');
            }
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API Error');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error('No text returned from Gemini');

        return text;
    } catch (error) {
        // Fallback simulation if API fails or key is missing (for demo purposes)
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('400')) {
            console.warn("Using fallback description due to missing/invalid API Key.");
            return `(ملاحظة: تأكد من وضع مفتاح API صحيح لتفعيل الذكاء الاصطناعي)\n\nهذا وصف تجريبي للمنتج: ${productName}. يتميز هذا المنتج بالجودة العالية والتصميم العصري الذي يناسب جميع الأذواق. احصل عليه الآن بسعر مميز وتمتع بتجربة استخدام فريدة.`;
        }
        throw error;
    }
}

// Helper: Typewriter Effect
function typeWriter(element, text, speed = 30) {
    return new Promise(resolve => {
        let i = 0;
        element.value = '';
        function type() {
            if (i < text.length) {
                element.value += text.charAt(i);
                element.scrollTop = element.scrollHeight; // Auto-scroll to bottom
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}


// --- Color Management System ---
let productColors = []; // For add product form
let editProductColors = []; // For edit product form

// Helper function to detect if a string is a hex color
function isHexColor(str) {
    return /^#[0-9A-F]{6}$/i.test(str);
}

// Helper function to get color display style
function getColorStyle(colorName) {
    if (isHexColor(colorName)) {
        return `background-color: ${colorName};`;
    }

    // Map Arabic color names to hex
    const colorMap = {
        'أحمر': '#FF0000',
        'أزرق': '#0000FF',
        'أخضر': '#00FF00',
        'أصفر': '#FFFF00',
        'أسود': '#000000',
        'أبيض': '#FFFFFF',
        'برتقالي': '#FFA500',
        'بنفسجي': '#800080',
        'وردي': '#FFC0CB',
        'بني': '#8B4513',
        'رمادي': '#808080',
        'ذهبي': '#FFD700',
        'فضي': '#C0C0C0',
        'سماوي': '#87CEEB',
        'بيج': '#F5F5DC'
    };

    return colorMap[colorName] ? `background-color: ${colorMap[colorName]};` : `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
}

// Add color to the add product form
function addColorToProduct() {
    const colorInput = document.getElementById('product-color-input');
    const colorsList = document.getElementById('product-colors-list');

    if (!colorInput || !colorsList) return;

    const colorValue = colorInput.value.trim();
    if (!colorValue) {
        alertUserMessage('الرجاء إدخال اسم اللون', 'warning');
        return;
    }

    if (productColors.includes(colorValue)) {
        alertUserMessage('هذا اللون موجود مسبقاً', 'warning');
        return;
    }

    productColors.push(colorValue);
    renderProductColors();
    colorInput.value = '';
}

// Remove color from add product form
window.removeColorFromProduct = function (colorName) {
    productColors = productColors.filter(c => c !== colorName);
    renderProductColors();
};

// Render colors in add product form
function renderProductColors() {
    const colorsList = document.getElementById('product-colors-list');
    if (!colorsList) return;

    if (productColors.length === 0) {
        colorsList.innerHTML = '<p class="text-gray-400 text-sm">لا توجد ألوان مضافة</p>';
        return;
    }

    colorsList.innerHTML = productColors.map(color => `
        <div class="flex items-center gap-2 bg-purple-700 px-3 py-2 rounded-lg">
            <div class="w-6 h-6 rounded-full border-2 border-white" style="${getColorStyle(color)}"></div>
            <span class="text-white text-sm">${color}</span>
            <button type="button" onclick="window.removeColorFromProduct('${color}')" 
                class="text-red-400 hover:text-red-300 ml-2">
                ✕
            </button>
        </div>
    `).join('');
}

// Add color to edit product form
function addColorToEditProduct() {
    const colorInput = document.getElementById('edit-product-color-input');
    const colorsList = document.getElementById('edit-product-colors-list');

    if (!colorInput || !colorsList) return;

    const colorValue = colorInput.value.trim();
    if (!colorValue) {
        alertUserMessage('الرجاء إدخال اسم اللون', 'warning');
        return;
    }

    if (editProductColors.includes(colorValue)) {
        alertUserMessage('هذا اللون موجود مسبقاً', 'warning');
        return;
    }

    editProductColors.push(colorValue);
    renderEditProductColors();
    colorInput.value = '';
}

// Remove color from edit product form
window.removeColorFromEditProduct = function (colorName) {
    editProductColors = editProductColors.filter(c => c !== colorName);
    renderEditProductColors();
};

// Render colors in edit product form
function renderEditProductColors() {
    const colorsList = document.getElementById('edit-product-colors-list');
    if (!colorsList) return;

    if (editProductColors.length === 0) {
        colorsList.innerHTML = '<p class="text-gray-400 text-sm">لا توجد ألوان مضافة</p>';
        return;
    }

    colorsList.innerHTML = editProductColors.map(color => `
        <div class="flex items-center gap-2 bg-purple-700 px-3 py-2 rounded-lg">
            <div class="w-6 h-6 rounded-full border-2 border-white" style="${getColorStyle(color)}"></div>
            <span class="text-white text-sm">${color}</span>
            <button type="button" onclick="window.removeColorFromEditProduct('${color}')" 
                class="text-red-400 hover:text-red-300 ml-2">
                ✕
            </button>
        </div>
    `).join('');
}

// Expose functions to global scope
window.removeColorFromProduct = removeColorFromProduct;
window.removeColorFromEditProduct = removeColorFromEditProduct;

// Initialize color management on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Add product color button
    const addColorBtn = document.getElementById('add-color-btn');
    if (addColorBtn) {
        addColorBtn.addEventListener('click', addColorToProduct);
    }

    // Add color on Enter key in add product form
    const colorInput = document.getElementById('product-color-input');
    if (colorInput) {
        colorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addColorToProduct();
            }
        });
    }

    // Edit product color button
    const editAddColorBtn = document.getElementById('edit-add-color-btn');
    if (editAddColorBtn) {
        editAddColorBtn.addEventListener('click', addColorToEditProduct);
    }

    // Add color on Enter key in edit product form
    const editColorInput = document.getElementById('edit-product-color-input');
    if (editColorInput) {
        editColorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addColorToEditProduct();
            }
        });
    }

    // Reset colors when add product modal is closed
    const addProductModal = document.getElementById('add-product-modal');
    if (addProductModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (addProductModal.classList.contains('hidden')) {
                        productColors = [];
                        renderProductColors();
                    }
                }
            });
        });
        observer.observe(addProductModal, { attributes: true });
    }
});

// Helper function to get colors array for saving
window.getProductColorsForSave = function () {
    return productColors.length > 0 ? productColors : [];
};

// Helper function to get edit product colors for saving
window.getEditProductColorsForSave = function () {
    return editProductColors.length > 0 ? editProductColors : [];
};

// Helper function to load colors into edit form
window.loadColorsIntoEditForm = function (colors) {
    editProductColors = colors && Array.isArray(colors) ? colors : [];
    renderEditProductColors();
};

// Helper function to display colors in product cards
window.displayProductColors = function (colors, containerElement) {
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
        return '';
    }

    return colors.map(color => `
        <div class="w-5 h-5 rounded-full shadow-md" 
             style="${getColorStyle(color)}" 
             title="${color}">
        </div>
    `).join('');
};

// Helper function to create color selector for checkout
window.createColorSelector = function (colors, productId) {
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
        return '';
    }

    return `
        <div class="mt-2">
            <label class="block text-sm font-medium text-white mb-2">اختر اللون:</label>
            <div class="flex flex-wrap gap-2">
                ${colors.map(color => `
                    <button type="button" 
                        class="color-option flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-purple-500 hover:border-green-400 transition-all duration-200 transform hover:scale-105"
                        data-product-id="${productId}"
                        data-color="${color}"
                        onclick="selectProductColor('${productId}', '${color}', this)">
                        <div class="w-6 h-6 rounded-full border border-white shadow-sm" style="${getColorStyle(color)}"></div>
                        <span class="text-sm text-white font-medium">${color}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
};

// Store selected colors for products in cart
let selectedProductColors = {};

// Function to select color for a product
window.selectProductColor = function (productId, color, buttonElement) {
    // Remove selection from other buttons for this product
    const allButtons = document.querySelectorAll(`.color-option[data-product-id="${productId}"]`);
    allButtons.forEach(btn => {
        btn.classList.remove('border-green-400', 'bg-green-600', 'ring-2', 'ring-white', 'scale-110');
        btn.classList.add('border-purple-500', 'hover:border-green-400');
        // Reset icon if added
        const icon = btn.querySelector('.check-icon');
        if (icon) icon.remove();
    });

    // Add selection to clicked button
    buttonElement.classList.remove('border-purple-500', 'hover:border-green-400');
    buttonElement.classList.add('border-green-400', 'bg-green-600', 'ring-2', 'ring-white', 'scale-110');

    // Add checkmark icon for extra visibility
    if (!buttonElement.querySelector('.check-icon')) {
        const checkIcon = document.createElement('span');
        checkIcon.className = 'check-icon ml-auto text-white font-bold';
        checkIcon.innerHTML = '✓';
        buttonElement.appendChild(checkIcon);
    }

    // Store the selected color
    selectedProductColors[productId] = color;
};

// Function to get selected color for a product
window.getSelectedProductColor = function (productId) {
    return selectedProductColors[productId] || null;
};

// Function to clear selected color for a product
window.clearSelectedProductColor = function (productId) {
    delete selectedProductColors[productId];
};

// Function to open edit product modal and load product data
window.openEditProductModal = function (product) {
    if (!product) return;

    const editModal = document.getElementById('edit-product-modal');
    if (!editModal) return;

    // Load basic product data
    const editProductId = document.getElementById('edit-product-id');
    const editProductName = document.getElementById('edit-product-name');
    const editProductPrice = document.getElementById('edit-product-price');
    const editProductDescription = document.getElementById('edit-product-description');
    const editProductCategory = document.getElementById('edit-product-category');
    const editProductAvailability = document.getElementById('edit-product-availability');
    const editProductFreeDelivery = document.getElementById('edit-product-free-delivery');
    const editProductRemoveWhiteBg = document.getElementById('edit-product-remove-white-bg');
    const editProductHasDiscount = document.getElementById('edit-product-has-discount');
    const editProductDiscountPrice = document.getElementById('edit-product-discount-price');
    const editProductDiscountContainer = document.getElementById('edit-product-discount-container');

    if (editProductId) editProductId.value = product.id;
    if (editProductName) editProductName.value = product.name || '';
    if (editProductPrice) editProductPrice.value = product.price || '';
    if (editProductDescription) editProductDescription.value = product.description || '';
    if (editProductCategory) editProductCategory.value = product.category || '';
    if (editProductAvailability) editProductAvailability.value = product.availability || '';
    if (editProductFreeDelivery) editProductFreeDelivery.checked = product.freeDelivery || false;
    if (editProductRemoveWhiteBg) editProductRemoveWhiteBg.checked = product.removeWhiteBackground || false;

    // Handle discount
    if (editProductHasDiscount && editProductDiscountPrice && editProductDiscountContainer) {
        if (product.discountPrice) {
            editProductHasDiscount.checked = true;
            editProductDiscountPrice.value = product.discountPrice;
            editProductDiscountContainer.classList.remove('hidden');
        } else {
            editProductHasDiscount.checked = false;
            editProductDiscountPrice.value = '';
            editProductDiscountContainer.classList.add('hidden');
        }
    }

    // Load image URLs
    for (let i = 1; i <= 5; i++) {
        const imageUrlInput = document.getElementById(`edit-product-image-url-${i}`);
        if (imageUrlInput) {
            if (product.imageUrls && product.imageUrls[i - 1]) {
                imageUrlInput.value = product.imageUrls[i - 1];
            } else if (i === 1 && product.imageUrl) {
                imageUrlInput.value = product.imageUrl;
            } else {
                imageUrlInput.value = '';
            }
        }
    }

    // Load colors using the helper function
    window.loadColorsIntoEditForm(product.colors || []);

    // Show the modal
    editModal.classList.remove('hidden');
};


