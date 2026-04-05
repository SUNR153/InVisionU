"""
Модуль скоринга кандидатов с использованием Claude API.
Отвечает за оценку анкет и детекцию AI-текста.

✅ УЛУЧШЕНИЯ:
- Полная валидация ответов Claude
- Обработка ошибок с логированием
- Type hints
- Докстринги
"""

import json
import logging
from typing import Dict, Any, Optional

import anthropic
from django.conf import settings

from .validators import validate_claude_response, ClaudeValidationError

logger = logging.getLogger(__name__)


def build_prompt(candidate) -> str:
    """
    Построить промпт для Claude API.
    
    Args:
        candidate: Объект Candidate модели
        
    Returns:
        Промпт в виде строки
    """
    return f"""Ты эксперт приёмной комиссии инновационного университета inVision U (Казахстан).
Университет даёт 100% гранты и ищет будущих лидеров, предпринимателей и создателей.

Оцени кандидата по 4 критериям от 0 до 10:

1. motivation  — насколько искренне и глубоко хочет учиться; конкретность целей
2. leadership  — примеры ини��иативы, реальных действий, лидерства
3. authenticity — живой голос, личная история, НЕ ChatGPT и не шаблоны
4. growth      — динамика развития, потенциал роста (не только текущий уровень)

ДАННЫЕ КАНДИДАТА
Имя: {candidate.full_name}
Возраст: {candidate.age} лет
Город: {candidate.city}
Школа / колледж: {candidate.school}

Почему хочет в inVision U:
{candidate.motivation or '— не заполнено —'}

Главное достижение:
{candidate.achievement or '— не заполнено —'}

Проблема которую хочет решить:
{candidate.problem or '— не заполнено —'}

Планы на 5 лет:
{candidate.future or '— не заполнено —'}

Эссе:
{candidate.essay or '— не заполнено —'}

ДЕТЕКТ AI-ТЕКСТА
Оцени вероятность того, что эссе написано с помощью ChatGPT / Claude / другого LLM (0.0 — 1.0).
Признаки AI-текста: идеальная структура без живых деталей, общие фразы ("я стремлюсь к..."),
отсутствие личных историй, слишком правильный синтаксис, нет ошибок и разговорного тона.

ВАЖНО: верни ТОЛЬКО валидный JSON — без markdown-блоков, без текста до или после.

{{
  "motivation":   7.5,
  "leadership":   8.0,
  "authenticity": 6.5,
  "growth":       7.0,
  "total":        7.25,
  "ai_detected":  false,
  "ai_probability": 0.12,
  "summary": "2-3 предложения о кандидате своими словами",
  "strengths": ["конкретная сильная сторона 1", "сильная сторона 2"],
  "red_flags": ["конкретный красный флаг если есть"],
  "recommendation": "high"
}}

Поле recommendation: "high" (≥8.0), "medium" (5.0–7.9), "low" (<5.0)
"""


def call_claude(prompt: str) -> Dict[str, Any]:
    """
    Отправить промпт в Claude API и получить оценку.
    
    ✅ С полной валидацией ответа
    
    Args:
        prompt: Промпт для Claude
        
    Returns:
        Валидированный словарь с оценками
        
    Raises:
        ClaudeValidationError: Если ответ невалиден
        anthropic.APIError: Если ошибка API
    """
    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

        message = client.messages.create(
            model='claude-sonnet-4-5',
            max_tokens=1000,
            messages=[{'role': 'user', 'content': prompt}],
        )

        raw = message.content[0].text.strip()
        logger.debug('Claude raw response: %s', raw[:200])  # Логировать первые 200 символов

    except anthropic.APIError as e:
        logger.error('Claude API error: %s', str(e))
        raise

    # Убрать markdown блоки если есть
    if raw.startswith('```'):
        lines = raw.split('\n')
        # Обработать как ```json ... ``` или просто ``` ... ```
        if lines[-1] == '```':
            raw = '\n'.join(lines[1:-1])
        else:
            raw = '\n'.join(lines[1:])
        logger.debug('Extracted JSON from markdown: %s', raw[:100])

    # ✅ КРИТИЧНО: Парсировать и валидировать JSON
    try:
        result = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error('Claude returned invalid JSON: %s | Error: %s', raw[:200], str(e))
        raise ClaudeValidationError(
            f"Claude returned invalid JSON. First 200 chars: {raw[:200]}"
        ) from e

    # ✅ КРИТИЧНО: Валидировать структуру
    try:
        validated = validate_claude_response(result)
    except ClaudeValidationError as e:
        logger.error('Claude response validation failed: %s', str(e))
        raise

    logger.info('Claude response validated successfully')
    return validated


def save_score(candidate, result: Dict[str, Any]):
    """
    Сохранить оценки в БД.
    
    Args:
        candidate: Объект Candidate
        result: Словарь с оценками (уже валидированный)
        
    Returns:
        Объект Score
    """
    from .models import Score

    total = float(result.get('total', 0))

    score, created = Score.objects.update_or_create(
        candidate=candidate,
        defaults={
            'motivation_score':   float(result['motivation']),
            'leadership_score':   float(result['leadership']),
            'authenticity_score': float(result['authenticity']),
            'growth_score':       float(result['growth']),
            'total_score':        total,
            'ai_detected':        bool(result['ai_detected']),
            'ai_probability':     float(result['ai_probability']),
            'summary':            result['summary'],
            'strengths':          result['strengths'],
            'red_flags':          result['red_flags'],
            'recommendation':     result['recommendation'],
            'raw_response':       result.get('raw_response', {}),
        },
    )
    
    action = 'created' if created else 'updated'
    logger.info(
        'Score %s for candidate %s: total=%.1f, ai_detected=%s',
        action,
        candidate.full_name,
        total,
        result['ai_detected']
    )
    
    return score


def run_scoring(candidate_id: int) -> Optional[Any]:
    """
    Запустить скоринг кандидата.
    
    Полный процесс:
    1. Получить кандидата
    2. Изменить статус на 'scoring'
    3. Отправить промпт в Claude
    4. Валидировать ответ
    5. Сохранить оценки
    6. Изменить статус на 'scored'
    
    Args:
        candidate_id: ID кандидата
        
    Returns:
        Объект Score или None если ошибка
    """
    from .models import Candidate

    # Получить кандидата
    try:
        candidate = Candidate.objects.get(id=candidate_id)
    except Candidate.DoesNotExist:
        logger.error('Candidate %d not found', candidate_id)
        return None

    logger.info('Starting scoring for candidate: %s (ID: %d)', candidate.full_name, candidate_id)
    
    # Изменить статус на scoring
    candidate.status = 'scoring'
    candidate.save(update_fields=['status'])
    logger.debug('Candidate status changed to "scoring"')

    try:
        # Построить промпт
        prompt = build_prompt(candidate)
        logger.debug('Prompt built, length: %d chars', len(prompt))
        
        # Отправить в Claude и валидировать
        result = call_claude(prompt)
        
        # Сохранить оценки
        score = save_score(candidate, result)

        # Изменить статус на scored
        candidate.status = 'scored'
        candidate.save(update_fields=['status'])
        logger.debug('Candidate status changed to "scored"')

        logger.info(
            'Successfully scored candidate %s: total=%.1f, ai_probability=%.2f',
            candidate.full_name,
            score.total_score,
            score.ai_probability,
        )
        return score

    except ClaudeValidationError as e:
        logger.error(
            'Validation error for candidate %s: %s',
            candidate.full_name,
            str(e),
            exc_info=True
        )
        candidate.status = 'new'
        candidate.save(update_fields=['status'])
        raise

    except json.JSONDecodeError as e:
        logger.error(
            'JSON parsing failed for candidate %s: %s',
            candidate.full_name,
            str(e),
            exc_info=True
        )
        candidate.status = 'new'
        candidate.save(update_fields=['status'])
        raise

    except Exception as e:
        logger.error(
            'Unexpected error during scoring for candidate %s: %s',
            candidate.full_name,
            str(e),
            exc_info=True
        )
        candidate.status = 'new'
        candidate.save(update_fields=['status'])
        raise
