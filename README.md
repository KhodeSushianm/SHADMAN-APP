<div align="center">

# 🎓 Shima Academy

### پنل مدیریتی آکادمی شیما شادمان

یک پنل دسکتاپ مینیمال و حرفه‌ای برای مدیریت دانش‌آموزان، برنامه‌های مطالعاتی، آزمون‌ها و یادداشت‌های مشاوره‌ای.

<br>

![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=for-the-badge&logo=electron&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Local%20Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111)

</div>

---

## ✨ درباره پروژه

**Shima Academy** برای یک workflow واقعی مشاوره کنکوری طراحی شده است؛ اطلاعات داخل یک دیتابیس SQLite محلی نگهداری می‌شوند و رابط کاربری با رویکرد **Neutral Matte** ساخته شده است.

> هدف این پروژه: یک پنل سریع، تمیز و قابل استفاده برای مشاور؛ بدون داده‌های Mock و بدون شلوغی غیرضروری.

## 🧩 بخش‌های فعلی

| بخش | کاربرد |
|---|---|
| 📊 داشبورد | خلاصه وضعیت و میانگین تراز از داده واقعی |
| 👥 دانش‌آموزان | ثبت، ویرایش، جستجو و حذف |
| 📅 برنامه‌ها | ثبت و پیگیری برنامه‌های مطالعه |
| 📈 آزمون‌ها | ثبت نتیجه و تراز آزمون |
| 📝 یادداشت‌ها | ثبت یادداشت‌های مشاوره‌ای |
| ⚙️ تنظیمات | مدیریت محل ذخیره دیتابیس |

## 🗄️ ذخیره‌سازی واقعی

دیتابیس با نام زیر ذخیره می‌شود:

```text
shima-academy.sqlite
```

در اولین اجرا می‌توانید پوشه ذخیره‌سازی را انتخاب کنید. اطلاعات بعدی مستقیماً در همان دیتابیس SQLite نگهداری می‌شوند.

## 📁 ساختار پروژه

```text
SHADMAN-APP/
├── index.html      # رابط کاربری و منطق پنل
├── main.js         # Electron + مدیریت فایل SQLite
├── preload.js      # پل امن بین UI و سیستم
├── package.json    # تنظیمات پروژه Electron
└── README.md       # مستندات
```

## 🚀 اجرا

پیش‌نیاز: **Node.js 18+**

```bash
npm install
npm start
```

## 🎨 طراحی

- Neutral Matte UI
- Dark / Light mode
- Responsive layout
- Sidebar navigation
- Modal forms
- Tables with search & filtering
- Empty states
- Lucide icons
- Focus / hover states
- Mobile navigation

## 📊 داده‌های نمودار

نمودار **میانگین تراز** از رکوردهای واقعی جدول `exams` محاسبه می‌شود و در صورت نبود داده، به‌جای اعداد ساختگی Empty State نمایش داده می‌شود.

## 🛠️ تکنولوژی‌ها

- Electron
- Vanilla JavaScript
- SQLite / sql.js
- HTML / CSS
- Lucide Icons

---

<div align="center">

### ساخته‌شده برای Shima Academy

**SHADMAN-APP** · Management Dashboard

</div>
