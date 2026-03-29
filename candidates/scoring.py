import json
import logging
import anthropic
from django.conf import settings

logger = logging.getLogger(__name__)


def build_prompt(candidate) -> str:
    return f"""Ты эксперт приёмной комиссии инновационного университета inVision U (Казахстан).
Университет даёт 100% гранты и ищет будущих лидеров, предпринимателей и создателей.

Оцени кандидата по 4 критериям от 0 до 10:

1. motivation  — насколько искренне и глубоко хочет учиться; конкретность целей
2. leadership  — примеры инициативы, реальных действий, лидерства
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


def call_claude(prompt: str) -> dict:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model='claude-sonnet-4-5',
        max_tokens=1000,
        messages=[{'role': 'user', 'content': prompt}],
    )

    raw = message.content[0].text.strip()
    logger.debug('Claude raw response: %s', raw)

    if raw.startswith('```'):
        lines = raw.split('\n')
        raw = '\n'.join(lines[1:-1] if lines[-1] == '```' else lines[1:])

    return json.loads(raw)


def save_score(candidate, result: dict):
    from candidates.models import Score

    total = result.get('total')
    if total is None:
        scores = [
            result.get('motivation', 0),
            result.get('leadership', 0),
            result.get('authenticity', 0),
            result.get('growth', 0),
        ]
        total = round(sum(scores) / len(scores), 2)

    score, _ = Score.objects.update_or_create(
        candidate=candidate,
        defaults={
            'motivation_score':   float(result.get('motivation', 0)),
            'leadership_score':   float(result.get('leadership', 0)),
            'authenticity_score': float(result.get('authenticity', 0)),
            'growth_score':       float(result.get('growth', 0)),
            'total_score':        float(total),
            'ai_detected':        bool(result.get('ai_detected', False)),
            'ai_probability':     float(result.get('ai_probability', 0)),
            'summary':            result.get('summary', ''),
            'strengths':          result.get('strengths', []),
            'red_flags':          result.get('red_flags', []),
            'recommendation':     result.get('recommendation', 'medium'),
            'raw_response':       result,
        },
    )
    return score


def run_scoring(candidate_id: int):
    from candidates.models import Candidate

    try:
        candidate = Candidate.objects.get(id=candidate_id)
    except Candidate.DoesNotExist:
        logger.error('Candidate %s not found', candidate_id)
        return None

    logger.info('Starting scoring for candidate %s', candidate.full_name)
    candidate.status = 'scoring'
    candidate.save(update_fields=['status'])

    try:
        prompt = build_prompt(candidate)
        result = call_claude(prompt)
        score  = save_score(candidate, result)

        candidate.status = 'scored'
        candidate.save(update_fields=['status'])

        logger.info(
            'Scored %s: total=%.1f, ai=%s',
            candidate.full_name, score.total_score, score.ai_detected,
        )
        return score

    except json.JSONDecodeError as e:
        logger.error('Failed to parse Claude response for %s: %s', candidate_id, e)
        candidate.status = 'new'
        candidate.save(update_fields=['status'])
        raise

    except Exception as e:
        logger.error('Scoring failed for %s: %s', candidate_id, e)
        candidate.status = 'new'
        candidate.save(update_fields=['status'])
        raise
