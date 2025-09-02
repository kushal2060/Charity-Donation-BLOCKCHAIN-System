from django.db import models

class UserProfile(models.Model):
    PROFILE_TYPES = [
        ('donor', 'Donor'),
        ('charity', 'Charity Creator'),
    ]
    
    wallet_address = models.CharField(max_length=42, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    profile_type = models.CharField(max_length=10, choices=PROFILE_TYPES)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.wallet_address[:10]}...)"
    
    class Meta:
        db_table = 'user_profiles'