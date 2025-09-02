from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import Donation
from .serializers import DonationSerializer, DonationCreateSerializer
from charities.models import Charity
from .merkle_utils import (
    create_charity_merkle_tree, 
    verify_donation_inclusion,
    get_donation_merkle_info
)

@api_view(['POST'])
def record_donation(request):
    """Record a new donation"""
    serializer = DonationCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            charity = Charity.objects.get(id=serializer.validated_data['charity_id'])
        except Charity.DoesNotExist:
            return Response(
                {'error': 'Charity not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if donation with this tx_hash already exists
        if Donation.objects.filter(tx_hash=serializer.validated_data['tx_hash']).exists():
            return Response(
                {'error': 'Donation with this transaction hash already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create donation
        donation = Donation.objects.create(
            charity=charity,
            donor_address=serializer.validated_data['donor_address'],
            amount=serializer.validated_data['amount'],
            tx_hash=serializer.validated_data['tx_hash'],
            confirmed=True,  # For simplicity, we'll mark as confirmed immediately
            confirmed_at=timezone.now()
        )
        
        # Update charity raised amount
        charity.raised_amount += donation.amount
        charity.save()
        
        response_serializer = DonationSerializer(donation)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def list_donations(request):
    """List all donations"""
    charity_id = request.GET.get('charity_id')
    donor_address = request.GET.get('donor_address')
    
    donations = Donation.objects.all()
    
    if charity_id:
        donations = donations.filter(charity_id=charity_id)
    
    if donor_address:
        donations = donations.filter(donor_address=donor_address)
    
    serializer = DonationSerializer(donations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_donation(request, donation_id):
    """Get specific donation by ID"""
    try:
        donation = Donation.objects.get(id=donation_id)
        serializer = DonationSerializer(donation)
        return Response(serializer.data)
    except Donation.DoesNotExist:
        return Response(
            {'error': 'Donation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
@api_view(['GET'])
def get_merkle_proof(request, donation_id):
    """Generate Merkle proof for a specific donation"""
    try:
        donation = Donation.objects.get(id=donation_id, confirmed=True)
        charity_id = donation.charity.id
        
        # Create Merkle tree for the charity
        merkle_tree = create_charity_merkle_tree(charity_id)
        if not merkle_tree:
            return Response(
                {'error': 'No confirmed donations found for this charity'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate proof for this donation
        proof = merkle_tree.generate_donation_proof(donation_id)
        if not proof:
            return Response(
                {'error': 'Donation not found in Merkle tree'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'donation_id': donation_id,
            'charity_id': charity_id,
            'merkle_proof': {
                'proof': proof.proof,
                'leaf': proof.leaf,
                'root': proof.root,
                'index': proof.index
            },
            'tree_info': merkle_tree.get_tree_info(),
            'donation_details': {
                'donor_address': donation.donor_address,
                'amount': str(donation.amount),
                'tx_hash': donation.tx_hash,
                'created_at': donation.created_at.isoformat()
            }
        })
        
    except Donation.DoesNotExist:
        return Response(
            {'error': 'Donation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to generate proof: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def verify_merkle_proof(request):
    """Verify a Merkle proof for donation inclusion"""
    try:
        data = request.data
        donation_id = data.get('donation_id')
        charity_id = data.get('charity_id')
        proof_data = data.get('merkle_proof')
        
        if not all([donation_id, charity_id, proof_data]):
            return Response(
                {'error': 'Missing required fields: donation_id, charity_id, merkle_proof'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the proof
        verification_result = verify_donation_inclusion(
            charity_id, proof_data
        )
        
        return Response({
            'verification_result': verification_result,
            'donation_id': donation_id,
            'charity_id': charity_id,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error verifying Merkle proof: {str(e)}")
        return Response(
            {'error': f'Verification failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_charity_merkle_info(request, charity_id):
    """Get Merkle tree information for a charity"""
    try:
        # Verify charity exists
        charity = Charity.objects.get(id=charity_id)
        
        # Get Merkle tree info
        merkle_info = get_donation_merkle_info(charity_id)
        
        return Response({
            'charity_id': charity_id,
            'charity_name': charity.name,
            'merkle_info': merkle_info
        })
        
    except Charity.DoesNotExist:
        return Response(
            {'error': 'Charity not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to get Merkle info: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )   