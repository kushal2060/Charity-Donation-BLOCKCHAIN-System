from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_charities, name='list_charities'),
    path('create/', views.create_charity, name='create_charity'),
    path('<int:charity_id>/', views.get_charity, name='get_charity'),
    path('<int:charity_id>/status/', views.update_charity_status, name='update_charity_status'),
    path('<int:charity_id>/onchain/', views.update_on_chain_id, name='update_on_chain_id'),  # <-- Add this line
]