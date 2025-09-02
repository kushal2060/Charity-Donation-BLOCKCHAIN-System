"""
Merkle Tree Implementation for Donation Verification

"""

import hashlib
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from .models import Donation

@dataclass
class MerkleProof:
    proof: List[str]
    leaf: str
    root: str
    index: int

class MerkleNode:
    def __init__(self, hash_value: str, left=None, right=None, data=None):
        self.hash = hash_value
        self.left = left
        self.right = right
        self.data = data

class MerkleTree:
    def __init__(self, data: List[str]):
        if not data:
            raise ValueError("Cannot build tree with empty data")
        
        self.leaves = [self._hash(item) for item in data]
        self.tree = []
        self.root = None
        self._build_tree()
    
    def _hash(self, data: str) -> str:
        """Create SHA-256 hash of data"""
        return hashlib.sha256(data.encode('utf-8')).hexdigest()
    
    def _build_tree(self):
        """Build the complete Merkle Tree bottom-up"""
        # Start with leaf nodes
        current_level = [
            MerkleNode(leaf, data=f"leaf_{i}") 
            for i, leaf in enumerate(self.leaves)
        ]
        
        self.tree.append(current_level[:])
        
        # Build tree level by level
        while len(current_level) > 1:
            next_level = []
            
            # Process pairs of nodes
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                
                # Combine hashes
                combined_hash = self._hash(left.hash + right.hash)
                parent_node = MerkleNode(
                    combined_hash,
                    left=left,
                    right=right if right != left else None
                )
                
                next_level.append(parent_node)
            
            self.tree.append(next_level[:])
            current_level = next_level
        
        self.root = current_level[0]
    
    def get_root_hash(self) -> str:
        """Get the root hash of the tree"""
        if not self.root:
            raise ValueError("Tree not built")
        return self.root.hash
    
    def generate_proof(self, leaf_index: int) -> MerkleProof:
        """Generate Merkle proof for a specific leaf"""
        if leaf_index < 0 or leaf_index >= len(self.leaves):
            raise ValueError("Invalid leaf index")
        
        proof = []
        current_index = leaf_index
        
        # Traverse from leaf to root, collecting sibling hashes
        for level in range(len(self.tree) - 1):
            current_level = self.tree[level]
            is_right_node = current_index % 2 == 1
            
            if is_right_node:
                # Current node is right, sibling is left
                sibling_index = current_index - 1
                if sibling_index >= 0:
                    proof.append(current_level[sibling_index].hash)
            else:
                # Current node is left, sibling is right
                sibling_index = current_index + 1
                if sibling_index < len(current_level):
                    proof.append(current_level[sibling_index].hash)
            
            # Move to parent level
            current_index = current_index // 2
        
        return MerkleProof(
            proof=proof,
            leaf=self.leaves[leaf_index],
            root=self.get_root_hash(),
            index=leaf_index
        )
    
    @staticmethod
    def verify_proof(merkle_proof: MerkleProof) -> bool:
        """Verify a Merkle proof"""
        computed_hash = merkle_proof.leaf
        current_index = merkle_proof.index
        
        # Recreate path to root using the proof
        for sibling_hash in merkle_proof.proof:
            is_right_node = current_index % 2 == 1
            
            if is_right_node:
                # Current node is right, sibling is left
                combined = sibling_hash + computed_hash
            else:
                # Current node is left, sibling is right
                combined = computed_hash + sibling_hash
            
            computed_hash = hashlib.sha256(combined.encode('utf-8')).hexdigest()
            current_index = current_index // 2
        
        return computed_hash == merkle_proof.root
    
    def get_tree_info(self) -> Dict:
        """Get tree information for debugging"""
        return {
            'total_leaves': len(self.leaves),
            'tree_depth': len(self.tree),
            'root_hash': self.get_root_hash(),
            'leaves': self.leaves[:5]  # First 5 leaves for preview
        }

class DonationMerkleTree(MerkleTree):
    """Specialized Merkle Tree for donation verification"""
    
    def __init__(self, donations: List[Donation]):
        # Create standardized donation strings
        donation_strings = []
        for donation in donations:
            donation_str = f"{donation.id}:{donation.donor_address}:{donation.amount}:{int(donation.created_at.timestamp())}:{donation.tx_hash}"
            donation_strings.append(donation_str)
        
        super().__init__(donation_strings)
        self.donations = donations
    
    def generate_donation_proof(self, donation_id: int) -> Optional[MerkleProof]:
        """Generate proof for a specific donation"""
        try:
            donation_index = next(
                i for i, donation in enumerate(self.donations) 
                if donation.id == donation_id
            )
            return self.generate_proof(donation_index)
        except StopIteration:
            return None
    
    def get_donation_hash(self, donation: Donation) -> str:
        """Get standardized hash for a donation"""
        donation_str = f"{donation.id}:{donation.donor_address}:{donation.amount}:{int(donation.created_at.timestamp())}:{donation.tx_hash}"
        return self._hash(donation_str)

# Utility functions
def create_charity_merkle_tree(charity_id: int) -> Optional[DonationMerkleTree]:
    """Create Merkle tree for all donations to a charity"""
    try:
        from .models import Donation
        donations = list(Donation.objects.filter(
            charity_id=charity_id,
            confirmed=True
        ).order_by('created_at'))
        
        if not donations:
            return None
        
        return DonationMerkleTree(donations)
    except Exception as e:
        print(f"Error creating Merkle tree: {e}")
        return None

def verify_donation_inclusion(
   
    charity_id: int,
    provided_proof: Dict
) -> Dict:
    """Verify if a donation is included in charity's Merkle tree"""
    try:
        # Create current Merkle tree
        merkle_tree = create_charity_merkle_tree(charity_id)
        if not merkle_tree:
            return {
                'verified': False,
                'error': 'No donations found for this charity'
            }
        
        # Get current root hash
        current_root = merkle_tree.get_root_hash()
        
        # Create proof object
        proof = MerkleProof(
            proof=provided_proof['proof'],
            leaf=provided_proof['leaf'],
            root=provided_proof['root'],
            index=provided_proof['index']
        )
        
        # Verify proof structure
        is_valid_proof = MerkleTree.verify_proof(proof)
        
        # Check if root matches current tree
        root_matches = proof.root == current_root
        
        return {
            'verified': is_valid_proof and root_matches,
            'proof_valid': is_valid_proof,
            'root_matches': root_matches,
            'current_root': current_root,
            'provided_root': proof.root,
            'tree_info': merkle_tree.get_tree_info()
        }
        
    except Exception as e:
        return {
            'verified': False,
            'error': str(e)
        }

def get_donation_merkle_info(charity_id: int) -> Dict:
    """Get Merkle tree information for a charity"""
    try:
        merkle_tree = create_charity_merkle_tree(charity_id)
        if not merkle_tree:
            return {'error': 'No donations found'}
        
        return {
            'root_hash': merkle_tree.get_root_hash(),
            'total_donations': len(merkle_tree.donations),
            'tree_depth': len(merkle_tree.tree),
            'created_at': merkle_tree.donations[0].created_at.isoformat() if merkle_tree.donations else None
        }
    except Exception as e:
        return {'error': str(e)}         