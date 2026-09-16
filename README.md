<div align="center">

<img src="assets/shima-academy-mark.svg" alt="Shima Academy" width="760" />

<br />

# SHADMAN-APP

### پنل مدیریتی آکادمی شیما شادمان

**A calm, focused workspace for student counseling management.**

<br />

[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Local%20Data-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![UI](https://img.shields.io/badge/UI-Neutral%20Matte-777067?style=flat-square)](#-design-system)

</div>

---

## 🖋️ نگاه پروژه

**Shadman App** یک داشبورد دسکتاپ برای مدیریت فرایند مشاوره کنکوری است؛ طراحی شده تا اطلاعات مهم در یک فضای آرام، خوانا و بدون شلوغی در دسترس باشند.

> **کمتر، مرتب‌تر، کاربردی‌تر.**
>
> رابط کاربری با زبان بصری **Neutral Matte** ساخته شده و داده‌ها به‌صورت محلی در SQLite نگهداری می‌شوند.

---

## ◈ What lives inside

<table>
<tr>
<td width="50%">

### 📊 Dashboard
نمای کلی وضعیت، آمار و روند **میانگین تراز** بر اساس داده واقعی.

</td>
<td width="50%">

### 👥 Students
ثبت، ویرایش، جستجو، فیلتر و مدیریت اطلاعات دانش‌آموزان.

</td>
</tr>
<tr>
<td>

### 📅 Study Plans
برنامه‌ریزی مطالعه، مدت زمان و پیگیری وضعیت اجرا.

</td>
<td>

### 📈 Exams
ثبت نتایج آزمون و ذخیره تراز هر رکورد در دیتابیس.

</td>
</tr>
<tr>
<td>

### 📝 Notes
یادداشت‌های مشاوره‌ای مرتبط با هر دانش‌آموز.

</td>
<td>

### ⚙️ Storage
انتخاب پوشه دلخواه برای نگهداری فایل SQLite.

</td>
</tr>
</table>

---

## 🎨 Design System

### Neutral Matte

یک زبان بصری خنثی و حرفه‌ای با تمرکز روی خوانایی:

`Charcoal` · `Stone` · `Warm Gray` · `Cream`

- ✦ بدون gradientهای تند و شلوغ
- ✦ کنتراست کنترل‌شده
- ✦ فرم‌های یکدست و مینیمال
- ✦ hover و focus ظریف
- ✦ dark / light mode
- ✦ responsive برای نمایشگرهای کوچک
- ✦ آیکون‌های Lucide
- ✦ empty state به‌جای داده ساختگی

---

## 🗄️ Local-first Architecture

اطلاعات اصلی در یک فایل واقعی SQLite ذخیره می‌شود:

```text
shima-academy.sqlite
```

```text
┌──────────────────────────────┐
│       Shima Academy UI       │
├──────────────────────────────┤
│ Students · Plans · Exams     │
│ Notes · Dashboard · Settings │
├──────────────────────────────┤
│          sql.js              │
├──────────────────────────────┤
│     shima-academy.sqlite     │
└──────────────────────────────┘
              │
              ▼
       Selected local folder
```

در نسخه Electron، مشاور می‌تواند پوشه ذخیره‌سازی را انتخاب کند و دیتابیس همان‌جا قرار می‌گیرد.

---

## 🧱 Project Structure

```text
SHADMAN-APP/
│
├── index.html
│   └── UI + application logic
│
├── main.js
│   └── Electron + filesystem bridge
│
├── preload.js
│   └── secure IPC bridge
│
├── package.json
│   └── Electron configuration
│
├── assets/
│   ├── shima-academy-mark.svg
│   └── screenshots/
│
└── README.md
```

---

## 🚀 Run locally

### 01 · Install

```bash
npm install
```

### 02 · Launch

```bash
npm start
```

### 03 · Choose storage

در اولین اجرا، پوشه‌ای را برای نگهداری دیتابیس انتخاب کنید.

**Requirement:** Node.js 18+

---

## 📐 Data model

| Table | Purpose |
|:---|:---|
| `students` | اطلاعات پایه و وضعیت دانش‌آموز |
| `plans` | برنامه‌های مطالعاتی |
| `exams` | نتایج و تراز آزمون‌ها |
| `notes` | یادداشت‌های مشاوره‌ای |

### Real data only

هیچ seed data یا عدد ساختگی برای داشبورد در نظر گرفته نشده است. اگر دیتابیس خالی باشد، پنل وضعیت خالی را نمایش می‌دهد.

نمودار میانگین تراز نیز مستقیماً از رکوردهای `exams` محاسبه می‌شود.

---

## 🧭 Current scope

```text
[✓] Student management
[✓] Study plans
[✓] Exam records
[✓] Counseling notes
[✓] SQLite persistence
[✓] Folder-based storage
[✓] Dashboard analytics
[✓] Dark / Light theme
[✓] Responsive UI
[ ] Future features — defined after advisor feedback
```

ساختار فعلی عمداً ساده نگه داشته شده تا امکانات بعدی بر اساس نیاز واقعی مشاور اضافه شوند.

---

## 🛠️ Built with

**Electron** · **Vanilla JavaScript** · **sql.js / SQLite** · **HTML** · **CSS** · **Lucide Icons**

---

<div align="center">

### Shima Academy
**A focused workspace for better counseling workflows.**

<br />

`SHADMAN-APP` · `Neutral Matte` · `Local-first`

</div>
