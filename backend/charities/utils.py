import requests
from django.conf import settings
from django.core.files.storage import default_storage
import tempfile
import os

def upload_to_ipfs(file):
    """Upload file to IPFS using Pinata"""
    
    # If Pinata credentials are not configured, return mock data
    if not settings.PINATA_API_KEY or not settings.PINATA_SECRET_API_KEY:
        # Save file locally for development
        file_path = default_storage.save(f'documents/{file.name}', file)
        return {
            'hash': f'mock_hash_{file.name}',
            'url': f'http://localhost:8000/media/{file_path}'
        }
    
    # Upload to Pinata IPFS
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    
    headers = {
        'pinata_api_key': settings.PINATA_API_KEY,
        'pinata_secret_api_key': settings.PINATA_SECRET_API_KEY
    }
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        for chunk in file.chunks():
            temp_file.write(chunk)
        temp_file_path = temp_file.name
    
    try:
        with open(temp_file_path, 'rb') as f:
            files = {'file': (file.name, f, file.content_type)}
            response = requests.post(url, files=files, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            ipfs_hash = result['IpfsHash']
            return {
                'hash': ipfs_hash,
                'url': f'https://gateway.pinata.cloud/ipfs/{ipfs_hash}'
            }
        else:
            raise Exception(f"Pinata upload failed: {response.text}")
    
    finally:
        # Clean up temporary file
        os.unlink(temp_file_path)