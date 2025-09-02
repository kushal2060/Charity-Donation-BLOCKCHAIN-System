from rest_framework import serializers
from .models import Charity
from users.serializers import UserProfileSerializer

class CharitySerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    
    class Meta:
        model = Charity
        fields = [
            'id', 'name', 'description', 'wallet_address', 'target_amount', 
            'raised_amount', 'category', 'status', 'creator', 'documents',
            'created_at', 'updated_at','on_chain_id'
        ]
        read_only_fields = ['id', 'raised_amount', 'status', 'created_at', 'updated_at']
    
    def get_creator(self, obj):
        return {
            'name': obj.creator_name,
            'email': obj.creator_email,
            'wallet_address': obj.creator_wallet.wallet_address
        }
    
    def get_documents(self, obj):
        return {
            'gov_id': obj.gov_id_url,
            'approval_doc': obj.approval_doc_url
        }

class CharityCreateSerializer(serializers.ModelSerializer):
    gov_id_file = serializers.FileField(write_only=True)
    approval_doc_file = serializers.FileField(write_only=True)
    creator_name = serializers.CharField(write_only=True)
    creator_email = serializers.EmailField(write_only=True)
   
    class Meta:
        model = Charity
        fields = [
            'name', 'description', 'wallet_address', 'target_amount', 
            'category', 'creator_name', 'creator_email', 
            'gov_id_file', 'approval_doc_file',
        ]