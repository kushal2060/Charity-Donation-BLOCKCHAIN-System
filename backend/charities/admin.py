from django.contrib import admin
from django.utils.html import format_html
from .models import Charity

@admin.register(Charity)
class CharityAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'creator_name', 'category', 'target_amount', 
        'raised_amount', 'status', 'created_at','id','on_chain_id'
    ]
    list_filter = ['status', 'category', 'created_at']
    list_editable = ('on_chain_id','status',)
    search_fields = ['name', 'creator_name', 'creator_email', 'wallet_address']
    readonly_fields = [
        'created_at', 'updated_at', 'raised_amount', 
        'gov_id_link', 'approval_doc_link'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'wallet_address')
        }),
        ('Financial', {
            'fields': ('target_amount', 'raised_amount')
        }),
        ('Creator Information', {
            'fields': ('creator_name', 'creator_email', 'creator_wallet')
        }),
        ('Documents', {
            'fields': ('gov_id_link', 'approval_doc_link')
        }),
        ('Status', {
            'fields': ('status', 'approved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def gov_id_link(self, obj):
        if obj.gov_id_url:
            return format_html(
                '<a href="{}" target="_blank">View Government ID</a>',
                obj.gov_id_url
            )
        return "No document"
    gov_id_link.short_description = "Government ID"
    
    def approval_doc_link(self, obj):
        if obj.approval_doc_url:
            return format_html(
                '<a href="{}" target="_blank">View Approval Document</a>',
                obj.approval_doc_url
            )
        return "No document"
    approval_doc_link.short_description = "Approval Document"
    
    actions = ['approve_charities', 'reject_charities']
    
    def approve_charities(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status='approved', approved_at=timezone.now())
        self.message_user(request, f'{updated} charities were approved.')
    approve_charities.short_description = "Approve selected charities"
    
    def reject_charities(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} charities were rejected.')
    reject_charities.short_description = "Reject selected charities"