# دليل تشغيل ونشر نظام متجر عطور مصطفى
# Deployment Instructions for Mostafa Perfumes Store

هذا الدليل يحتوي على الخطوات اللازمة لتشغيل النظام في بيئة الإنتاج (Hosting/VPS).

## 1. متطلبات النظام (Requirements)
* Python 3.9+
* Node.js 18+
* PostgreSQL (أو SQLite للبدء السريع)
* Nginx
* Gunicorn

---

## 2. إعداد الواجهة الخلفية (Backend Setup - Django)

### أ. تثبيت المكتبات:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # في ويندوز: venv\Scripts\activate
pip install -r requirements.txt
```

### ب. ملف الإعدادات (.env):
قم بإنشاء ملف `.env` في مجلد `backend/` وأضف البيانات التالية:
```env
DEBUG=False
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your_server_ip
DATABASE_URL=postgres://user:password@localhost:5432/dbname
```

### ج. قاعدة البيانات والملفات الساكنة:
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # لإنشاء حساب المدير
```

### د. التشغيل باستخدام Gunicorn:
```bash
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

---

## 3. إعداد الواجهة الأمامية (Frontend Setup - React/Vite)

### أ. تثبيت المكتبات:
```bash
cd frontend
npm install
```

### ب. ملف الإعدادات (.env.production):
قم بإنشاء ملف `.env.production` وتأكد من توجيهه للرابط الصحيح للـ API:
```env
VITE_API_URL=https://yourdomain.com/api/
```

### ج. بناء المشروع:
```bash
npm run build
```
سيتم إنشاء المجلد `dist` الذي يحتوي على ملفات الموقع الجاهزة للنشر.

---

## 4. إعداد Nginx (Configuring Nginx)

قم بإنشاء ملف إعدادات لـ Nginx (مثلاً في `/etc/nginx/sites-available/perfume_store`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend Files
    location / {
        root /path/to/your/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
    }

    # Static & Media Files
    location /static/ {
        alias /path/to/your/backend/static/;
    }

    location /media/ {
        alias /path/to/your/backend/media/;
    }
}
```

---

## 5. ملاحظات هامة:
* تأكد من فتح المنافذ (Ports) اللازمة في جدار الحماية (Firewall) مثل 80 و 443.
* يفضل استخدام `Certbot` للحصول على شهادة SSL مجانية وتأمين الموقع (HTTPS).
* تأكد من تحديث روابط التواصل الاجتماعي في `Header.jsx` إذا تغيرت مستقبلاً.

---
تم إعداد هذا النظام بواسطة Antigravity AI.
