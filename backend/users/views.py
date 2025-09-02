from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer

@api_view(['POST'])
def create_profile(request):
    """Create a new user profile"""
    serializer = UserProfileSerializer(data=request.data)
    Data=request.data
    print("Received data:", Data)
    if serializer.is_valid():
        print("Creating profile with data:", serializer.validated_data)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_profile(request, wallet_address):
    """Get user profile by wallet address"""
    try:
        profile = UserProfile.objects.get(wallet_address=wallet_address)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'Profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
def update_profile(request, wallet_address):
    """Update user profile"""
    try:
        profile = UserProfile.objects.get(wallet_address=wallet_address)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'Profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )