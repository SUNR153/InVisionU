"""
Celery конфигурация для асинхронных задач.

Используется для:
- Скоринга кандидатов
- Отправки писем
- Переоценки
"""

import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('invisionu')

# Загрузить конфиг из Django settings с префиксом CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматически открыть все tasks из приложений
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
