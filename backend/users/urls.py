from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.create_profile, name='create_profile'),
    path('profile/<str:wallet_address>/', views.get_profile, name='get_profile'),
    path('profile/<str:wallet_address>/update/', views.update_profile, name='update_profile'),
]