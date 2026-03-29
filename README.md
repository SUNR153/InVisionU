# inVision U — AI Система отбора кандидатов
> Decentrathon 5.0 · Трек AI inDrive

AI-система для первичного отбора кандидатов в inVision University. Кандидаты заполняют анкету на сайте, Claude API автоматически оценивает их по 4 критериям, приёмная комиссия видит результаты в дашборде.

---

## Как это работает

Кандидат заполняет анкету → Django отправляет в Claude API
→ Claude возвращает скор + анализ → Комиссия видит в дашборде

Claude оценивает по 4 критериям (0–10):
- Мотивация — искренность и глубина целей
- Лидерство — реальные примеры инициативы
- Аутентичность — живой голос, не ChatGPT
- Рост — потенциал и динамика развития

---

## Стек

| Часть | Технологии |
|---|---|
| Backend | Django 4.2, DRF, PostgreSQL, JWT |
| AI | Claude API (claude-sonnet) |
| Frontend | React 18, Vite, React Router |
| Deploy | Railway (backend), Vercel (frontend) |

---

## Структура проекта

inVisionU/
├── backend/               # Django
│   ├── config/            # settings, urls
│   ├── candidates/        # модели, скоринг, API
│   └── accounts/          # авторизация, JWT
├── frontend/              # React — сайт кандидата
└── dashboard/             # React — панель комиссии

---

## Быстрый старт

### 1. Backend

cd backend

# Установить зависимости
pip install -r requirements.txt

# Создать .env
cp .env.example .env
# Заполнить ANTHROPIC_API_KEY и данные БД

# Создать базу данных
psql -U postgres -c "CREATE DATABASE invisionu;"

# Миграции
python manage.py makemigrations candidates accounts
python manage.py migrate

# Создать суперюзера (для комиссии)
python manage.py createsuperuser

# Запустить
python manage.py runserver

### 2. Frontend (сайт кандидата)

cd frontend
npm install
npm run dev
# → http://localhost:5173

### 3. Dashboard (панель комиссии)

cd dashboard
npm install
npm run dev
# → http://localhost:5174

---

## Переменные окружения

Создай backend/.env на основе backend/.env.example:

SECRET_KEY=твой-секретный-ключ
DEBUG=True

DB_NAME=invisionu
DB_USER=postgres
DB_PASSWORD=твой_пароль
DB_HOST=localhost
DB_PORT=5432

ANTHROPIC_API_KEY=sk-ant-...

Получить ключ Claude: [console.anthropic.com](https://console.anthropic.com)

---

## API эндпоинты

### Авторизация
| Метод | URL | Описание |
|---|---|---|
| POST | /api/auth/register/ | Регистрация |
| POST | /api/auth/login/ | Логин |
| POST | /api/auth/logout/ | Логаут |
| GET  | /api/auth/me/ | Текущий пользователь |

### Кандидат
| Метод | URL | Описание |
|---|---|---|
| GET    | /api/me/ | Моя анкета |
| POST   | /api/me/ | Создать анкету |
| PATCH  | /api/me/ | Обновить анкету |
| POST   | /api/me/submit/ | Отправить заявку → запускает скоринг |

### Комиссия (только staff)
| Метод | URL | Описание |
|---|---|---|
| GET  | /api/admin/stats/ | Статистика дашборда |
| GET  | /api/admin/candidates/ | Все кандидаты |
| GET  | /api/admin/candidates/?status=shortlisted | Фильтр |
| GET  | /api/admin/candidates/?search=Айгерим | Поиск |
| GET  | /api/admin/candidates/<id>/ | Карточка кандидата |
| POST | /api/admin/candidates/<id>/status/ | Сменить статус |
| POST | /api/admin/candidates/<id>/rescore/ | Переоценить |

---

## Страницы сайта

| URL | Страница |
|---|---|
| / | Лендинг |
| /register | Регистрация |
| /login | Вход |
| /form | Анкета (4 шага) |
| /cabinet | Личный кабинет |

---

## Деплой

### Backend → Railway
1. Создай проект на [railway.app](https://railway.app)
2. Добавь PostgreSQL плагин
3. Подключи GitHub репозиторий
4. Добавь переменные окружения
5. python manage.py migrate через Railway CLI

### Frontend → Vercel
1. Подключи репозиторий на [vercel.com](https://vercel.com)
2. Root Directory: frontend
3. Добавь VITE_API_URL=https://твой-бэк.railway.app/api
4. Deploy

---

## Команда

Проект создан для хакатона Decentrathon 5.0, трек AI inDrive.

Дедлайн: 5 апреля 2025, 23:59
