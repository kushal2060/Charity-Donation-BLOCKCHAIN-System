from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.utils import timezone
from .models import Charity
from .serializers import CharitySerializer, CharityCreateSerializer
from users.models import UserProfile
from .utils import upload_to_ipfs

@api_view(['GET'])
def list_charities(request):
    """List all charities"""
    charities = Charity.objects.all().order_by('-created_at')
    serializer = CharitySerializer(charities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_charity(request, charity_id):
    """Get specific charity by ID"""
    try:
        charity = Charity.objects.get(id=charity_id)
        serializer = CharitySerializer(charity)
        return Response(serializer.data)
    except Charity.DoesNotExist:
        return Response(
            {'error': 'Charity not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_charity(request):
    """Create a new charity"""
    serializer = CharityCreateSerializer(data=request.data)
    print("Request data:", request.data)
    print("Files:", request.FILES)
    
    if serializer.is_valid():
        # Get creator profile
        try:
            creator_profile = UserProfile.objects.get(
                wallet_address=serializer.validated_data['wallet_address']
            )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Creator profile not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Upload files to IPFS
        gov_id_file = serializer.validated_data.pop('gov_id_file')
        approval_doc_file = serializer.validated_data.pop('approval_doc_file')
        
        try:
            gov_id_result = upload_to_ipfs(gov_id_file)
            approval_doc_result = upload_to_ipfs(approval_doc_file)
        except Exception as e:
            return Response(
                {'error': f'File upload failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create charity
        charity = Charity.objects.create(
            name=serializer.validated_data['name'],
            description=serializer.validated_data['description'],
            wallet_address=serializer.validated_data['wallet_address'],
            target_amount=serializer.validated_data['target_amount'],
            category=serializer.validated_data['category'],
            creator_name=serializer.validated_data['creator_name'],
            creator_email=serializer.validated_data['creator_email'],
            creator_wallet=creator_profile,
            gov_id_hash=gov_id_result['hash'],
            gov_id_url=gov_id_result['url'],
            approval_doc_hash=approval_doc_result['hash'],
            approval_doc_url=approval_doc_result['url'],
        )
        
       
        response_serializer = CharitySerializer(charity)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        
    
    else:
        # Add this to see what validation failed
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_charity_status(request, charity_id):
    """Update charity status (admin only)"""
    try:
        charity = Charity.objects.get(id=charity_id)
        new_status = request.data.get('status')
        
        if new_status not in ['pending', 'approved', 'rejected']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        charity.status = new_status
        if new_status == 'approved':
            charity.approved_at = timezone.now()
        
        charity.save()
        
        serializer = CharitySerializer(charity)
        return Response(serializer.data)
        
    except Charity.DoesNotExist:
        return Response(
            {'error': 'Charity not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def update_on_chain_id(request, charity_id):
    charity = Charity.objects.get(id=charity_id)
    charity.on_chain_id = request.data.get('on_chain_id')
    charity.save()
    return Response({'success': True})
