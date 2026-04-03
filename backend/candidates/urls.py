from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.register,    name='register'),
    path('auth/login/',    views.login_view,  name='login'),
    
    path('me/',         views.my_profile,         name='my-profile'),
    path('me/submit/',  views.submit_application, name='submit-application'),

    path('admin/stats/',                            views.dashboard_stats,   name='admin-stats'),
    path('admin/candidates/',                       views.all_candidates,    name='admin-candidates'),
    path('admin/candidates/<int:pk>/',              views.candidate_detail,  name='admin-candidate-detail'),
    path('admin/candidates/<int:pk>/status/',       views.update_status,     name='admin-update-status'),
    path('admin/candidates/<int:pk>/rescore/',   views.rescore_candidate,  name='admin-rescore'),
    path('admin/candidates/<int:pk>/comments/', views.candidate_comments, name='admin-comments'),
]