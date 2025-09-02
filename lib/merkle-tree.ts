// Merkle Tree Implementation from Scratch
// This allows users to verify their donations are included in charity records

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

export interface MerkleProof {
  proof: string[];
  leaf: string;
  root: string;
  index: number;
}

export class MerkleTree {
  private leaves: string[];
  private tree: MerkleNode[][];
  private root: MerkleNode | null;

  constructor(data: string[]) {
    this.leaves = data.map(item => this.hash(item));
    this.tree = [];
    this.root = null;
    this.buildTree();
  }

  // SHA-256 hash function (simplified for educational purposes)
  private hash(data: string): string {
    // In production, use crypto.createHash('sha256')
    // For educational purposes, we'll use a simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Build the complete Merkle Tree
  private buildTree(): void {
    if (this.leaves.length === 0) {
      throw new Error('Cannot build tree with empty data');
    }

    // Start with leaf nodes
    let currentLevel: MerkleNode[] = this.leaves.map((leaf, index) => ({
      hash: leaf,
      data: `leaf_${index}`
    }));

    this.tree.push([...currentLevel]);

    // Build tree bottom-up
    while (currentLevel.length > 1) {
      const nextLevel: MerkleNode[] = [];

      // Process pairs of nodes
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate if odd

        const combinedHash = this.hash(left.hash + right.hash);
        const parentNode: MerkleNode = {
          hash: combinedHash,
          left: left,
          right: right !== left ? right : undefined
        };

        nextLevel.push(parentNode);
      }

      this.tree.push([...nextLevel]);
      currentLevel = nextLevel;
    }

    this.root = currentLevel[0];
  }

  // Get the root hash
  public getRootHash(): string {
    if (!this.root) {
      throw new Error('Tree not built');
    }
    return this.root.hash;
  }

  // Generate proof for a specific leaf
  public generateProof(leafIndex: number): MerkleProof {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error('Invalid leaf index');
    }

    const proof: string[] = [];
    let currentIndex = leafIndex;

    // Traverse from leaf to root, collecting sibling hashes
    for (let level = 0; level < this.tree.length - 1; level++) {
      const currentLevel = this.tree[level];
      const isRightNode = currentIndex % 2 === 1;
      
      if (isRightNode) {
        // If current node is right, sibling is left
        const siblingIndex = currentIndex - 1;
        if (siblingIndex >= 0) {
          proof.push(currentLevel[siblingIndex].hash);
        }
      } else {
        // If current node is left, sibling is right
        const siblingIndex = currentIndex + 1;
        if (siblingIndex < currentLevel.length) {
          proof.push(currentLevel[siblingIndex].hash);
        }
      }

      // Move to parent level
      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      proof,
      leaf: this.leaves[leafIndex],
      root: this.getRootHash(),
      index: leafIndex
    };
  }

  // Verify a proof
  public static verifyProof(merkleProof: MerkleProof): boolean {
    const { proof, leaf, root, index } = merkleProof;
    
    let computedHash = leaf;
    let currentIndex = index;

    // Recreate the path to root using the proof
    for (const siblingHash of proof) {
      const isRightNode = currentIndex % 2 === 1;
      
      if (isRightNode) {
        // Current node is right, sibling is left
        computedHash = MerkleTree.hashPair(siblingHash, computedHash);
      } else {
        // Current node is left, sibling is right
        computedHash = MerkleTree.hashPair(computedHash, siblingHash);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return computedHash === root;
  }

  // Hash two values together
  private static hashPair(left: string, right: string): string {
    let hash = 0;
    const combined = left + right;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Get tree visualization (for debugging)
  public getTreeVisualization(): string {
    if (!this.root) return 'Empty tree';

    let result = 'Merkle Tree Structure:\n';
    
    for (let level = this.tree.length - 1; level >= 0; level--) {
      const indent = '  '.repeat(this.tree.length - level - 1);
      result += `Level ${level}: ${indent}`;
      
      this.tree[level].forEach((node, index) => {
        result += `[${node.hash.substring(0, 8)}...] `;
      });
      result += '\n';
    }

    return result;
  }

  // Get all leaves
  public getLeaves(): string[] {
    return [...this.leaves];
  }

  // Get tree depth
  public getDepth(): number {
    return this.tree.length;
  }
}

// Donation-specific Merkle Tree utilities
export class DonationMerkleTree extends MerkleTree {
  constructor(donations: Array<{
    id: string;
    donor: string;
    amount: string;
    timestamp: number;
    txHash: string;
  }>) {
    // Create standardized donation strings for hashing
    const donationStrings = donations.map(donation => 
      `${donation.id}:${donation.donor}:${donation.amount}:${donation.timestamp}:${donation.txHash}`
    );
    
    super(donationStrings);
  }

  // Generate proof for a specific donation
  public generateDonationProof(donationId: string, donations: Array<{
    id: string;
    donor: string;
    amount: string;
    timestamp: number;
    txHash: string;
  }>): MerkleProof | null {
    const donationIndex = donations.findIndex(d => d.id === donationId);
    
    if (donationIndex === -1) {
      return null;
    }

    return this.generateProof(donationIndex);
  }
}

export const merkleUtils = {
  // Create donation hash for verification
  createDonationHash: (donation: {
    id: string;
    donor: string;
    amount: string;
    timestamp: number;
    txHash: string;
  }): string => {
    return `${donation.id}:${donation.donor}:${donation.amount}:${donation.timestamp}:${donation.txHash}`;
  },

  // Format proof for display
  formatProof: (proof: MerkleProof): string => {
    return JSON.stringify({
      leaf: proof.leaf,
      root: proof.root,
      proof: proof.proof,
      index: proof.index
    }, null, 2);
  },

  // Verify donation inclusion
  verifyDonationInclusion: (
    donation: any,
    proof: MerkleProof,
    rootHash: string
  ): boolean => {
    return proof.root === rootHash && MerkleTree.verifyProof(proof);
  }
};