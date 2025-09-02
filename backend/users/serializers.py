from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    walletAddress = serializers.CharField(source='wallet_address')
    profileType = serializers.CharField(source='profile_type')

    class Meta:
        model = UserProfile
        fields = ['walletAddress', 'name', 'email', 'profileType']
        read_only_fields = ['is_verified', 'created_at']