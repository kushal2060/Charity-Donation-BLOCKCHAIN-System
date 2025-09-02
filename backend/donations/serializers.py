from rest_framework import serializers
from .models import Donation
from charities.serializers import CharitySerializer

class DonationSerializer(serializers.ModelSerializer):
    charity_name = serializers.CharField(source='charity.name', read_only=True)
    
    class Meta:
        model = Donation
        fields = [
            'id', 'charity', 'charity_name', 'donor_address', 'amount', 
            'tx_hash', 'block_number', 'confirmed', 'created_at', 'confirmed_at'
        ]
        read_only_fields = ['id', 'confirmed', 'block_number', 'created_at', 'confirmed_at']

class DonationCreateSerializer(serializers.ModelSerializer):
    charity_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Donation
        fields = ['charity_id', 'donor_address', 'amount', 'tx_hash']