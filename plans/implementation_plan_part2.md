# 📁 هيكل الملفات والتفاصيل التقنية
# Implementation Plan - Part 2

---

## 📁 Backend Structure

```
backend/
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── accounts/
│   │   ├── models.py          # User, StaffProfile
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   │
│   ├── products/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── filters.py
│   │   └── admin.py
│   │
│   ├── orders/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── signals.py         # إرسال الإيميلات
│   │
│   ├── cart/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── crm/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services.py        # تقسيم العملاء تلقائياً
│   │
│   ├── analytics/
│   │   ├── models.py
│   │   ├── services.py        # MRR, Reports
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── recommendations/
│   │   ├── models.py
│   │   ├── engine.py          # خوارزمية التوصيات
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── cms/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   └── marketing/
│       ├── models.py          # Coupon
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
│
├── core/
│   ├── permissions.py
│   ├── pagination.py
│   ├── utils.py
│   └── middleware.py
│
├── templates/emails/
│   ├── base.html
│   ├── order_confirmation.html
│   ├── order_shipped.html
│   ├── order_delivered.html
│   └── welcome.html
│
├── static/
├── media/
├── manage.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
└── .env.example
```

---

## 📁 Frontend Structure (Store)

```
frontend/
├── public/
│   ├── favicon.ico
│   └── fonts/
│       ├── Tajawal-Regular.woff2
│       ├── Tajawal-Bold.woff2
│       └── Poppins-Medium.woff2
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Accordion.jsx
│   │   │   └── ThemeToggle.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   ├── SearchModal.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSlider.jsx
│   │   │   ├── FeaturedProducts.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── BrandsSection.jsx
│   │   │   ├── BestsellersSection.jsx
│   │   │   ├── NewArrivalsSection.jsx
│   │   │   └── PromoSection.jsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductFilters.jsx
│   │   │   ├── FilterDrawer.jsx (Mobile)
│   │   │   ├── SortDropdown.jsx
│   │   │   ├── VariantSelector.jsx
│   │   │   ├── NotesPyramid.jsx
│   │   │   ├── RatingBars.jsx
│   │   │   ├── ImageGallery.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── QuickView.jsx
│   │   │   └── ShareButtons.jsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── CartSummary.jsx
│   │   │   ├── CouponInput.jsx
│   │   │   └── EmptyCart.jsx
│   │   │
│   │   └── checkout/
│   │       ├── CheckoutForm.jsx
│   │       ├── CustomerInfoStep.jsx
│   │       ├── AddressStep.jsx
│   │       ├── ReviewStep.jsx
│   │       ├── CitySelect.jsx
│   │       ├── OrderSummary.jsx
│   │       └── OrderSuccess.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Category.jsx
│   │   ├── Brand.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderTracking.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── Terms.jsx
│   │   └── NotFound.jsx
│   │
│   ├── hooks/
│   │   ├── useCart.js
│   │   ├── useProducts.js
│   │   ├── useTheme.js
│   │   ├── useApi.js
│   │   ├── useDebounce.js
│   │   └── useLocalStorage.js
│   │
│   ├── store/
│   │   ├── cartStore.js
│   │   ├── themeStore.js
│   │   └── filtersStore.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── cart.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
│
├── tailwind.config.js
├── vite.config.js
├── package.json
└── .env.example
```

---

## 📁 Admin Dashboard Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── NotificationDropdown.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCards.jsx
│   │   │   ├── RecentOrders.jsx
│   │   │   ├── TopProducts.jsx
│   │   │   ├── SalesChart.jsx
│   │   │   ├── LowStockAlert.jsx
│   │   │   └── RevenueChart.jsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── MRRChart.jsx
│   │   │   ├── MRRComparisonCard.jsx
│   │   │   ├── SalesOverTime.jsx
│   │   │   ├── TopProductsTable.jsx
│   │   │   ├── CustomerSegmentsPie.jsx
│   │   │   ├── CitySalesMap.jsx
│   │   │   └── DateRangePicker.jsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductsTable.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── VariantsManager.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── NotesEditor.jsx
│   │   │   ├── StockManager.jsx
│   │   │   └── BulkActions.jsx
│   │   │
│   │   ├── orders/
│   │   │   ├── OrdersTable.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── OrderStatusFlow.jsx
│   │   │   ├── OrderTimeline.jsx
│   │   │   ├── PrintInvoice.jsx
│   │   │   └── OrderFilters.jsx
│   │   │
│   │   ├── crm/
│   │   │   ├── CustomersTable.jsx
│   │   │   ├── CustomerProfile.jsx
│   │   │   ├── CustomerStats.jsx
│   │   │   ├── CustomerOrders.jsx
│   │   │   ├── SegmentFilter.jsx
│   │   │   ├── TagsManager.jsx
│   │   │   ├── InteractionLog.jsx
│   │   │   └── AddInteractionModal.jsx
│   │   │
│   │   ├── cms/
│   │   │   ├── HeroSliderManager.jsx
│   │   │   ├── HeroSlideForm.jsx
│   │   │   ├── BannerManager.jsx
│   │   │   └── DragDropSort.jsx
│   │   │
│   │   ├── marketing/
│   │   │   ├── CouponsTable.jsx
│   │   │   ├── CouponForm.jsx
│   │   │   └── CouponStats.jsx
│   │   │
│   │   └── settings/
│   │       ├── ShippingSettings.jsx
│   │       ├── StoreInfo.jsx
│   │       └── EmailSettings.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── ProductEdit.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── Customers.jsx
│   │   ├── CustomerDetail.jsx
│   │   ├── Analytics.jsx
│   │   ├── CMS.jsx
│   │   ├── Coupons.jsx
│   │   ├── Settings.jsx
│   │   └── Login.jsx
│   │
│   └── ...
└── ...
```

---

## 📊 Analytics Dashboard Details

### MRR Dashboard
```
┌────────────────────────────────────────────────────────────┐
│  📊 لوحة الإيرادات الشهرية (MRR)                           │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  الإيرادات   │  الطلبات     │  العملاء     │  متوسط الطلب  │
│  💰 45,000   │  📦 156      │  👥 89       │  💵 288       │
│  ↑ 15%       │  ↑ 8%        │  ↑ 22%       │  ↓ 3%         │
├──────────────┴──────────────┴──────────────┴───────────────┤
│                                                            │
│  [═══════════ مخطط الإيرادات 12 شهر ═══════════]          │
│   50K ┤                              ╭─╮                   │
│   40K ┤                         ╭────╯ ╰╮                  │
│   30K ┤              ╭──────────╯       │                  │
│   20K ┤    ╭─────────╯                  │                  │
│   10K ┤────╯                            │                  │
│       └────┬────┬────┬────┬────┬────┬────┘                 │
│           فبر  مار  أبر  ماي  يون  يول  أغس                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  🏆 الأكثر مبيعاً هذا الشهر                                │
├────────────────────────────────────────────────────────────┤
│  1. عطر العود الملكي     │ 50ml  │ 45 قطعة │ 5,400 ر.س    │
│  2. عطر الورد الدمشقي    │ 100ml │ 32 قطعة │ 6,400 ر.س    │
│  3. عطر المسك الأبيض     │ 30ml  │ 28 قطعة │ 2,240 ر.س    │
└────────────────────────────────────────────────────────────┘
```

### تحليل العبوات
```
┌────────────────────────────────────────────┐
│  📦 توزيع المبيعات حسب حجم العبوة         │
├────────────────────────────────────────────┤
│                                            │
│  30ml  ████████████░░░░░░░░ 35%           │
│  50ml  ██████████████████░░ 45%           │
│  100ml █████████░░░░░░░░░░░ 20%           │
│                                            │
│  💡 العبوة 50ml الأكثر مبيعاً              │
└────────────────────────────────────────────┘
```

---

## 💡 الميزات الإضافية المقترحة

### أولوية عالية ⭐⭐⭐
| الميزة | الوصف |
|--------|-------|
| **كوبونات الخصم** | خصم نسبي أو ثابت مع حد أدنى للطلب |
| **الشراء كضيف** | بدون إجبار على التسجيل |
| **تنبيهات المخزون** | إيميل للأدمن عند انخفاض المخزون |
| **مشاركة المنتج** | واتساب، تويتر، نسخ الرابط |
| **تتبع الطلب** | برقم الطلب ورقم الجوال |

### أولوية متوسطة ⭐⭐
| الميزة | الوصف |
|--------|-------|
| **تغليف الهدايا** | خيار إضافي بسعر |
| **بطاقة إهداء** | رسالة شخصية مع الطلب |
| **عروض محدودة** | عد تنازلي للعروض |
| **إشعار التوفر** | تنبيه عند توفر منتج نفد |
| **العينات المجانية** | عينة مع طلبات فوق مبلغ معين |

### مستقبلية ⭐
| الميزة | الوصف |
|--------|-------|
| **برنامج الولاء** | نقاط مع كل شراء |
| **مقارنة العطور** | مقارنة 2-3 عطور |
| **PWA** | تثبيت على الجوال |
| **WhatsApp API** | إشعارات واتساب |

---

## 🔐 الأمان

### إجراءات مطلوبة
| الإجراء | التطبيق |
|---------|---------|
| HTTPS | Let's Encrypt / Cloudflare |
| CORS | النطاقات المحددة فقط |
| Rate Limiting | django-ratelimit |
| Input Validation | DRF serializers |
| XSS | React auto-escape + bleach |
| CSRF | Django middleware |
| SQL Injection | Django ORM |
| File Upload | أنواع وأحجام محددة |
| Passwords | Argon2 hashing |

### Backup
```bash
# يومي
0 3 * * * pg_dump perfume_store > /backups/db_$(date +\%Y\%m\%d).sql
0 4 * * * rsync -av /app/media/ /backups/media/
```

---

## 🖥️ الاستضافة

### VPS (مقترح للبداية)
| المزود | السعر | المواصفات |
|--------|-------|-----------|
| **Hetzner** | €4-8/شهر | 2GB RAM, 40GB SSD |
| **DigitalOcean** | $12-24/شهر | 2GB RAM, 50GB SSD |
| **Contabo** | $6-12/شهر | 4GB RAM, 100GB |

### Production Stack
```
Cloudflare (CDN + SSL + WAF)
        ↓
    Nginx (Reverse Proxy)
        ↓
    ┌───────────────┐
    │ Gunicorn      │ ← Django
    │ (4 workers)   │
    └───────────────┘
        ↓
    ┌───────────────┐
    │ PostgreSQL    │
    │ Redis         │
    └───────────────┘
```

---

## 📅 الجدول الزمني

| المرحلة | المدة | المخرجات |
|---------|-------|----------|
| **1. Setup** | 2 أيام | Django + React + DB |
| **2. Models** | 4 أيام | جميع النماذج + Migrations |
| **3. API** | 5 أيام | جميع الـ Endpoints |
| **4. Frontend** | 10 أيام | المتجر كامل |
| **5. Dashboard** | 10 أيام | لوحة التحكم كاملة |
| **6. CRM** | 4 أيام | ملفات العملاء + التقسيم |
| **7. Analytics** | 4 أيام | MRR + التقارير |
| **8. Features** | 4 أيام | الكوبونات والميزات |
| **9. Testing** | 5 أيام | الاختبارات + Bug fixes |
| **10. Deploy** | 2 أيام | النشر + DNS |

**الإجمالي: ~7 أسابيع**

---

## 🚀 الخطوات التالية

بعد موافقتك:
1. إنشاء مشروع Django مع الهيكل أعلاه
2. إعداد PostgreSQL و Redis
3. بناء Products models
4. إنشاء React مع التصميم
