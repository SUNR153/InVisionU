# inVision U — AI Система отбора кандидатов

> **Decentrathon 5.0 · Трек AI inDrive**

AI-система для первичного отбора кандидатов в inVision University. Кандидаты заполняют анкету на сайте, Claude API автоматически оценивает их по 4 критериям, приёмная комиссия видит результаты в дашборде и оставляет комментарии.

---

## Демо

| Компонент | URL |
|---|---|
| Сайт кандидата | https://in-vision-u-livid.vercel.app |
| Панель комиссии | https://in-vision-u-fihe.vercel.app |
| Backend API | https://invisionu-production-f427.up.railway.app |
| API Docs (Swagger) | https://invisionu-production-f427.up.railway.app/api/docs/ |

---

## Как это работает

```
Кандидат заполняет анкету (4 шага)
        ↓
Django отправляет данные в Claude API
        ↓
Claude оценивает по 4 критериям + детектирует AI-текст
        ↓
Комиссия видит скор, анализ и принимает решение
        ↓
Кандидат получает email с результатом
```

### Критерии оценки Claude (0–10)

| Критерий | Описание |
|---|---|
| Мотивация | Искренность и глубина желания учиться, конкретность целей |
| Лидерство | Примеры реальной инициативы и действий |
| Аутентичность | Живой голос, личная история, не ChatGPT |
| Рост | Динамика развития и потенциал, не только текущий уровень |

### Детект AI-текста

Система анализирует эссе на признаки генерации ChatGPT/Claude:
- Идеальная структура без живых деталей
- Общие фразы вместо конкретных историй
- Отсутствие эмоционального голоса
- Слишком правильный синтаксис

---

## Стек технологий

| Слой | Технологии |
|---|---|
| Backend | Django 4.2, DRF, PostgreSQL, JWT |
| AI | Claude API (claude-sonnet-4) |
| Frontend | React 18, Vite, React Router |
| Email | Gmail SMTP |
| Deploy | Railway (backend + DB), Vercel (frontend) |

---

## Структура проекта

```
inVisionU/
├── backend/               # Django
│   ├── config/            # settings.py, urls.py
│   ├── candidates/        # модели, скоринг, API
│   │   ├── models.py      # Candidate, Score, Comment
│   │   ├── scoring.py     # интеграция с Claude API
│   │   ├── emails.py      # письма кандидатам
│   │   └── views.py       # REST API эндпоинты
│   └── accounts/          # авторизация, JWT
├── frontend/              # React — сайт кандидата
│   └── src/
│       ├── pages/         # Landing, Register, Login, Form, Cabinet
│       └── components/    # Navbar, ProgressBar, StatusBadge, Toast
└── dashboard/             # React — панель комиссии
    └── src/
        ├── pages/         # Login, Candidates, CandidateCard, Stats
        └── components/    # Sidebar, Badges, Comments
```

---

## Быстрый старт

### Требования
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend

# Установить зависимости
pip install -r requirements.txt

# Создать .env файл
cp .env.example .env
# Заполнить все переменные

# Создать БД
psql -U postgres -c "CREATE DATABASE invisionu;"

# Миграции
python manage.py makemigrations candidates accounts
python manage.py migrate

# Создать суперюзера (комиссия)
python manage.py createsuperuser

# Запустить
python manage.py runserver
# → http://localhost:8000
```

### Frontend (сайт кандидата)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Dashboard (панель комиссии)

```bash
cd dashboard
npm install
npm run dev
# → http://localhost:5174
```

---

## Переменные окружения

Создай `backend/.env`:

```env
# Django
SECRET_KEY=твой-секретный-ключ
DEBUG=True

# База данных
DB_NAME=invisionu
DB_USER=postgres
DB_PASSWORD=пароль
DB_HOST=localhost
DB_PORT=5432

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=твой@gmail.com
EMAIL_HOST_PASSWORD=пароль-приложения-16-символов
DEFAULT_FROM_EMAIL=inVisionU <твой@gmail.com>
```

---

## API Документация

### Авторизация

```bash
# Регистрация
POST /api/auth/register/
{
  "email": "candidate@example.com",
  "password": "password123",
  "password2": "password123"
}
# → { "access": "...", "refresh": "...", "is_staff": false }

# Логин
POST /api/auth/login/
{
  "email": "candidate@example.com",
  "password": "password123"
}
# → { "access": "...", "refresh": "...", "is_staff": false }
```

### Кандидат

```bash
# Создать анкету
POST /api/me/
Authorization: Bearer <token>
{
  "first_name": "Айгерим",
  "last_name": "Сейткали",
  "age": 17,
  "city": "Алматы",
  "school": "НИШ Алматы"
}

# Обновить анкету (шаг за шагом)
PATCH /api/me/
Authorization: Bearer <token>
{
  "motivation": "Я хочу изменить образование в Казахстане...",
  "essay": "Моя история началась в маленьком городе..."
}

# Отправить заявку (запускает AI скоринг)
POST /api/me/submit/
Authorization: Bearer <token>
# → { "message": "Заявка принята! Оценка займёт 1–2 минуты." }

# Получить статус и результат
GET /api/me/
# → { "status": "scored", "score": { "total_score": 8.2, ... } }
```

### Комиссия (только staff)

```bash
# Статистика дашборда
GET /api/admin/stats/
# → { "total": 124, "avg_score": 6.8, "shortlisted": 18, "ai_flagged": 23 }

# Список кандидатов с фильтрами
GET /api/admin/candidates/?status=scored&sort=score_desc
GET /api/admin/candidates/?search=Айгерим
GET /api/admin/candidates/?ai_detected=true

# Карточка кандидата
GET /api/admin/candidates/1/

# Сменить статус
POST /api/admin/candidates/1/status/
{ "status": "shortlisted" }  # или "rejected"

# Добавить комментарий (кандидат получит письмо)
POST /api/admin/candidates/1/comments/
{ "text": "Отличная мотивация, рекомендуем к зачислению" }

# Переоценить
POST /api/admin/candidates/1/rescore/
```

---

## Пример ответа AI скоринга

```json
{
  "motivation": 8.5,
  "leadership": 7.0,
  "authenticity": 9.0,
  "growth": 8.0,
  "total": 8.125,
  "ai_detected": false,
  "ai_probability": 0.08,
  "summary": "Кандидат демонстрирует искреннюю мотивацию и конкретный опыт лидерства. Эссе написано живым языком с личными деталями.",
  "strengths": [
    "Конкретный пример организации экологического проекта",
    "Чёткое понимание миссии inVision U",
    "Аутентичный голос без шаблонных фраз"
  ],
  "red_flags": [],
  "recommendation": "high"
}
```

---

## Email уведомления

Система отправляет письма в следующих случаях:

| Событие | Получатель | Содержание |
|---|---|---|
| Регистрация | Кандидат | Приветствие + напоминание о дедлайне |
| Отправка заявки | Кандидат | Подтверждение получения |
| Шортлист | Кандидат | Поздравление 🎉 |
| Отклонение | Кандидат | Вежливый отказ |
| Комментарий комиссии | Кандидат | Текст комментария |

---

## Ограничения и риски

- **ИИ не принимает финальных решений** — только помогает комиссии расставить приоритеты
- **Human-in-the-loop** — все решения подтверждаются комиссией вручную
- **Без демографического скоринга** — система не использует город, школу или возраст как критерии качества
- **AI-детект не абсолютен** — вероятность ошибки ~15%, поэтому помечается как "требует проверки"
- **Данные хранятся безопасно** — пароли хешируются, JWT токены с коротким сроком жизни

---

## Деплой

| Сервис | Платформа | URL |
|---|---|---|
| Backend + DB | Railway | invisionu-production-f427.up.railway.app |
| Frontend | Vercel | in-vision-u-livid.vercel.app |
| Dashboard | Vercel | in-vision-u-fihe.vercel.app |

---

## Команда

Проект создан для хакатона **Decentrathon 5.0**, трек **AI inDrive**.

**Дедлайн:** 5 апреля 2025, 23:59