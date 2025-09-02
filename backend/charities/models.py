from django.db import models
from users.models import UserProfile

class Charity(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    CATEGORY_CHOICES = [
        ('Education', 'Education'),
        ('Healthcare', 'Healthcare'),
        ('Environment', 'Environment'),
        ('Poverty', 'Poverty'),
        ('Disaster Relief', 'Disaster Relief'),
        ('Animal Welfare', 'Animal Welfare'),
        ('Human Rights', 'Human Rights'),
        ('Other', 'Other'),
    ]
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    wallet_address = models.CharField(max_length=42)
    target_amount = models.DecimalField(max_digits=20, decimal_places=8)
    raised_amount = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Creator information
    creator_name = models.CharField(max_length=100)
    creator_email = models.EmailField()
    creator_wallet = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE,
        to_field='wallet_address'
    )
    
    # Document storage (IPFS hashes)
    gov_id_hash = models.CharField(max_length=100, blank=True)
    approval_doc_hash = models.CharField(max_length=100, blank=True)
    gov_id_url = models.URLField(blank=True)
    approval_doc_url = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    on_chain_id = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} - {self.status}"
    
    class Meta:
        db_table = 'charities'
        verbose_name_plural = 'Charities'