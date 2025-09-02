from django.db import models
from charities.models import Charity

class Donation(models.Model):
    id = models.AutoField(primary_key=True)
    charity = models.ForeignKey(Charity, on_delete=models.CASCADE, related_name='donations')
    donor_address = models.CharField(max_length=42)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    tx_hash = models.CharField(max_length=66, unique=True)  # Ethereum transaction hash
    block_number = models.BigIntegerField(null=True, blank=True)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.amount} ETH to {self.charity.name}"
    
    def save(self, *args, **kwargs):
        # Update charity raised amount when donation is confirmed
        if self.confirmed and not self.pk:
            self.charity.raised_amount += self.amount
            self.charity.save()
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'donations'
        ordering = ['-created_at']