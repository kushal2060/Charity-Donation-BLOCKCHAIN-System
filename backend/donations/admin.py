from django.contrib import admin
from django.utils.html import format_html
from .models import Donation

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = [
        'charity', 'donor_address_short', 'amount', 'confirmed', 
        'tx_hash_short', 'created_at'
    ]
    list_filter = ['confirmed', 'created_at', 'charity__category']
    search_fields = ['donor_address', 'tx_hash', 'charity__name']
    readonly_fields = ['created_at', 'confirmed_at', 'tx_link']
    
    fieldsets = (
        ('Donation Information', {
            'fields': ('charity', 'donor_address', 'amount')
        }),
        ('Blockchain Information', {
            'fields': ('tx_hash', 'tx_link', 'block_number')
        }),
        ('Status', {
            'fields': ('confirmed', 'confirmed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    def donor_address_short(self, obj):
        return f"{obj.donor_address[:10]}...{obj.donor_address[-6:]}"
    donor_address_short.short_description = "Donor Address"
    
    def tx_hash_short(self, obj):
        return f"{obj.tx_hash[:10]}...{obj.tx_hash[-6:]}"
    tx_hash_short.short_description = "Transaction Hash"
    
    def tx_link(self, obj):
        if obj.tx_hash:
            return format_html(
                '<a href="https://sepolia.etherscan.io/tx/{}" target="_blank">View on Etherscan</a>',
                obj.tx_hash
            )
        return "No transaction hash"
    tx_link.short_description = "Etherscan Link"