from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'wallet_address', 'profile_type', 'is_verified', 'created_at']
    list_filter = ['profile_type', 'is_verified', 'created_at']
    search_fields = ['name', 'email', 'wallet_address']
    readonly_fields = ['wallet_address', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('wallet_address', 'name', 'email', 'profile_type')
        }),
        ('Verification', {
            'fields': ('is_verified',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )