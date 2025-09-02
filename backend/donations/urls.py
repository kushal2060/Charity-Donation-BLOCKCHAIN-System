from django.urls import path
from . import views

urlpatterns = [
    path('', views.record_donation, name='record_donation'),
    path('list/', views.list_donations, name='list_donations'),
    path('<int:donation_id>/', views.get_donation, name='get_donation'),
    path('<int:donation_id>/merkle-proof/', views.get_merkle_proof, name='get_merkle_proof'),
    path('verify-merkle-proof/', views.verify_merkle_proof, name='verify_merkle_proof'),
    path('charity/<int:charity_id>/merkle-info/', views.get_charity_merkle_info, name='get_charity_merkle_info'),
]