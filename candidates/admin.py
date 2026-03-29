from django.contrib import admin
from .models import Candidate, Score


class ScoreInline(admin.StackedInline):
    model  = Score
    extra  = 0
    readonly_fields = [
        'motivation_score', 'leadership_score', 'authenticity_score', 'growth_score',
        'total_score', 'ai_detected', 'ai_probability',
        'summary', 'strengths', 'red_flags', 'recommendation', 'scored_at',
    ]
    can_delete = False


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display  = ['full_name', 'city', 'school', 'status', 'completion_percent', 'created_at']
    list_filter   = ['status', 'city']
    search_fields = ['first_name', 'last_name', 'city', 'school']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ScoreInline]

    def completion_percent(self, obj):
        return f'{obj.completion_percent}%'
    completion_percent.short_description = 'Заполненность'


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display  = ['candidate', 'total_score', 'recommendation', 'ai_detected', 'scored_at']
    list_filter   = ['recommendation', 'ai_detected']
    readonly_fields = [
        'candidate', 'motivation_score', 'leadership_score', 'authenticity_score',
        'growth_score', 'total_score', 'ai_detected', 'ai_probability',
        'summary', 'strengths', 'red_flags', 'recommendation', 'raw_response', 'scored_at',
    ]
