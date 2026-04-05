"""
Валидаторы для Claude API и поисковых запросов.
Обеспечивают безопасность и целостность данных.
"""

import re
import logging
from typing import Dict, Any, Optional
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)


class ClaudeValidationError(ValueError):
    """Ошибка валидации ответа Claude"""
    pass


def validate_claude_score(value: float, min_val: float = 0, max_val: float = 10) -> float:
    """
    Валидировать оценку из Claude (0-10 или 0-1 для вероятности).
    
    Args:
        value: Значение для проверки
        min_val: Минимальное допустимое значение
        max_val: Максимальное допустимое значение
        
    Returns:
        Валидированное значение
        
    Raises:
        ClaudeValidationError: Если значение вне диапазона или неверного типа
    """
    try:
        num_value = float(value)
    except (TypeError, ValueError):
        raise ClaudeValidationError(f"Score must be a number, got {type(value).__name__}")
    
    if not (min_val <= num_value <= max_val):
        raise ClaudeValidationError(
            f"Score {num_value} out of range [{min_val}, {max_val}]"
        )
    
    return round(num_value, 2)


def validate_claude_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Валидировать структуру ответа от Claude API.
    
    Проверяет:
    - Наличие всех обязательных полей
    - Типы данных
    - Диапазоны значений
    - Длину текстовых полей
    
    Args:
        data: Словарь ответа от Claude
        
    Returns:
        Очищенный и валидированный словарь
        
    Raises:
        ClaudeValidationError: Если данные невалидны
    """
    if not isinstance(data, dict):
        raise ClaudeValidationError(f"Expected dict, got {type(data).__name__}")
    
    # Обязательные числовые поля (0-10)
    score_fields = {
        'motivation': 'мотивация',
        'leadership': 'лидерство',
        'authenticity': 'аутентичность',
        'growth': 'рост',
        'total': 'итоговая оценка',
    }
    
    validated = {}
    
    # Валидировать оценки
    for field, description in score_fields.items():
        if field not in data:
            raise ClaudeValidationError(f"Missing required field: {field} ({description})")
        
        try:
            validated[field] = validate_claude_score(data[field], min_val=0, max_val=10)
        except ClaudeValidationError as e:
            raise ClaudeValidationError(f"{field}: {str(e)}")
    
    # Валидировать вероятность AI (0-1)
    if 'ai_probability' not in data:
        raise ClaudeValidationError("Missing required field: ai_probability")
    
    try:
        validated['ai_probability'] = validate_claude_score(
            data['ai_probability'],
            min_val=0.0,
            max_val=1.0
        )
    except ClaudeValidationError as e:
        raise ClaudeValidationError(f"ai_probability: {str(e)}")
    
    # Валидировать boolean флаг
    if 'ai_detected' not in data:
        raise ClaudeValidationError("Missing required field: ai_detected")
    
    if not isinstance(data['ai_detected'], bool):
        raise ClaudeValidationError(
            f"ai_detected must be boolean, got {type(data['ai_detected']).__name__}"
        )
    validated['ai_detected'] = data['ai_detected']
    
    # Валидировать текстовые поля с ограничением длины
    validated['summary'] = _validate_text_field(
        data.get('summary', ''),
        field_name='summary',
        min_length=10,
        max_length=500,
        required=False
    )
    
    # Валидировать списки
    validated['strengths'] = _validate_list_field(
        data.get('strengths', []),
        field_name='strengths',
        max_items=10,
        max_item_length=200
    )
    
    validated['red_flags'] = _validate_list_field(
        data.get('red_flags', []),
        field_name='red_flags',
        max_items=10,
        max_item_length=200
    )
    
    # Валидировать рекомендацию
    recommendation = data.get('recommendation', 'medium').lower()
    if recommendation not in ['high', 'medium', 'low']:
        logger.warning(f"Invalid recommendation '{recommendation}', using 'medium'")
        recommendation = 'medium'
    validated['recommendation'] = recommendation
    
    # Сохранить сырой ответ для отладки
    validated['raw_response'] = data
    
    logger.info(
        'Claude response validated: score=%.1f, ai_probability=%.2f, ai_detected=%s',
        validated['total'],
        validated['ai_probability'],
        validated['ai_detected']
    )
    
    return validated


def _validate_text_field(
    value: Any,
    field_name: str,
    min_length: int = 0,
    max_length: int = 1000,
    required: bool = True
) -> str:
    """Валидировать текстовое поле"""
    if not isinstance(value, str):
        if required:
            raise ClaudeValidationError(
                f"{field_name} must be string, got {type(value).__name__}"
            )
        return ""
    
    text = value.strip()
    
    if required and len(text) < min_length:
        raise ClaudeValidationError(
            f"{field_name} too short (min {min_length} chars)"
        )
    
    if len(text) > max_length:
        logger.warning(
            f"{field_name} truncated from {len(text)} to {max_length} chars"
        )
        text = text[:max_length]
    
    return text


def _validate_list_field(
    value: Any,
    field_name: str,
    max_items: int = 10,
    max_item_length: int = 200
) -> list:
    """Валидировать поле со списком"""
    if not isinstance(value, list):
        logger.warning(f"{field_name} is not a list, converting to empty list")
        return []
    
    validated_items = []
    for i, item in enumerate(value[:max_items]):
        if isinstance(item, str):
            cleaned = item.strip()[:max_item_length]
            if cleaned:
                validated_items.append(cleaned)
        else:
            logger.warning(f"{field_name}[{i}] is not string, skipping")
    
    return validated_items


def validate_search_query(search_term: Optional[str], max_length: int = 100) -> str:
    """
    Валидировать поисковый запрос.
    
    Удаляет опасные символы и ограничивает длину.
    
    Args:
        search_term: Поисковый запрос
        max_length: Максимальная длина
        
    Returns:
        Очищенный поисковый запрос
    """
    if not search_term:
        return ""
    
    if not isinstance(search_term, str):
        return ""
    
    # Убрать пробелы в начале/конце и ограничить длину
    cleaned = search_term.strip()[:max_length]
    
    # Проверить, что это не только пробелы или спецсимволы
    if not cleaned.replace(' ', '').replace('-', '').replace("'", ''):
        return ""
    
    # Убрать опасные символы (но сохранить кириллицу и латиницу)
    # Разрешить: буквы, цифры, пробелы, дефисы, апострофы
    cleaned = re.sub(r"[^\w\s\-'а-яА-ЯёЁ]", "", cleaned)
    
    return cleaned


def validate_email_for_api(email: str) -> str:
    """
    Валидировать email перед отправкой в API.
    
    Args:
        email: Email адрес
        
    Returns:
        Валидированный email (в нижнем регистре)
        
    Raises:
        ValidationError: Если email невалиден
    """
    email = email.lower().strip()
    
    # Б��зовая проверка формата
    if not re.match(r'^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$', email):
        raise ValidationError("Invalid email format")
    
    if len(email) > 254:  # RFC 5321
        raise ValidationError("Email too long")
    
    return email
