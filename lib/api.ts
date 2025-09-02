const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Charity {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  targetAmount: number;
  raisedAmount: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  documents: {
    govId: string;
    approvalDoc: string;
  };
  creator: {
    name: string;
    email: string;
    wallet_address: string;
  };
  onChainId?: string;
}

export interface CreateCharityData {
  name: string;
  description: string;
  targetAmount: number;
  category: string;
  walletAddress: string;
  creatorName: string;
  creatorEmail: string;
  govIdFile: File;
  approvalDocFile: File;
}

export interface UserProfileData {
  name: string;
  email: string;
  walletAddress: string;
  profileType: 'donor' | 'charity';
}

// Mock data for when API is not available
const mockCharities: Charity[] = [
  {
    id: '1',
    name: 'Clean Water Initiative',
    description: 'Providing clean water access to rural communities in developing countries. Our mission is to build sustainable water systems that serve communities for generations.',
    walletAddress: '0x742d35cc6633C0532925a3b8d34b87CB8C4E8fB3',
    targetAmount: 10,
    raisedAmount: 3.5,
    category: 'Environment',
    status: 'approved',
    createdAt: '2024-01-15T10:00:00Z',
    documents: {
      govId: 'https://example.com/gov-id-1.pdf',
      approvalDoc: 'https://example.com/approval-1.pdf',
    },
    creator: {
      name: 'Water Foundation',
      email: 'contact@waterfoundation.org',
      wallet_address: '0x742d35cc6633C0532925a3b8d34b87CB8C4E8fB3',
    },
  },
  {
    id: '2',
    name: 'Education for All',
    description: 'Supporting underprivileged children with educational resources, school supplies, and scholarship opportunities to break the cycle of poverty.',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c30C6213',
    targetAmount: 15,
    raisedAmount: 8.2,
    category: 'Education',
    status: 'approved',
    createdAt: '2024-01-20T14:30:00Z',
    documents: {
      govId: 'https://example.com/gov-id-2.pdf',
      approvalDoc: 'https://example.com/approval-2.pdf',
    },
    creator: {
      name: 'Education First',
      email: 'info@educationfirst.org',
      wallet_address: '0x8ba1f109551bD432803012645Hac136c30C6213',
    },
  },
  {
    id: '3',
    name: 'Medical Aid Relief',
    description: 'Providing essential medical supplies and healthcare services to communities affected by natural disasters and humanitarian crises.',
    walletAddress: '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
    targetAmount: 20,
    raisedAmount: 12.7,
    category: 'Healthcare',
    status: 'approved',
    createdAt: '2024-01-25T09:15:00Z',
    documents: {
      govId: 'https://example.com/gov-id-3.pdf',
      approvalDoc: 'https://example.com/approval-3.pdf',
    },
    creator: {
      name: 'Global Medical Relief',
      email: 'help@medicalrelief.org',
      wallet_address: '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
    },
  },
  {
    id: '4',
    name: 'Food Security Program',
    description: 'Fighting hunger by providing nutritious meals and establishing sustainable food programs in food-insecure communities.',
    walletAddress: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    targetAmount: 12,
    raisedAmount: 0,
    category: 'Hunger',
    status: 'pending',
    createdAt: '2024-02-01T16:45:00Z',
    documents: {
      govId: 'https://example.com/gov-id-4.pdf',
      approvalDoc: 'https://example.com/approval-4.pdf',
    },
    creator: {
      name: 'Food Security Alliance',
      email: 'contact@foodsecurity.org',
      wallet_address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    },
  },
];

export class ApiService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

static async createUserProfile(profileData: UserProfileData) {
  try {
    return await ApiService.makeRequest('/users/profile/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    // Return mock success response when API is not available
    console.warn('API not available, using mock response for profile creation');
    return {
      id: Date.now().toString(),
      ...profileData,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
  }
}

  static async getUserProfile(walletAddress: string) {
    try {
      return await ApiService.makeRequest(`/users/profile/${walletAddress}/`);
    } catch (error) {
      // Return null when profile not found or API not available
      console.warn('API not available or profile not found');
      throw new Error('Profile not found');
    }
  }

  static async createCharity(charityData: CreateCharityData) {
    try {
      const formData = new FormData();
      formData.append('name', charityData.name);
      formData.append('description', charityData.description);
      formData.append('target_amount', charityData.targetAmount.toString());
      formData.append('category', charityData.category);
      formData.append('wallet_address', charityData.walletAddress);
      formData.append('creator_name', charityData.creatorName);
      formData.append('creator_email', charityData.creatorEmail);
      formData.append('gov_id_file', charityData.govIdFile);
      formData.append('approval_doc_file', charityData.approvalDocFile);

      const response = await fetch(`${API_BASE_URL}/charities/create/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Return mock success response when API is not available
      console.warn('API not available, using mock response for charity creation');
      return {
        id: Date.now().toString(),
        name: charityData.name,
        description: charityData.description,
        walletAddress: charityData.walletAddress,
        targetAmount: charityData.targetAmount,
        raisedAmount: 0,
        category: charityData.category,
        status: 'pending',
        createdAt: new Date().toISOString(),
        documents: {
          govId: 'mock-gov-id-url',
          approvalDoc: 'mock-approval-doc-url',
        },
        creator: {
          name: charityData.creatorName,
          email: charityData.creatorEmail,
          walletAddress: charityData.walletAddress,
        },
      };
    }
  }

 static async getCharities(): Promise<Charity[]> {
    try {
       const response = await this.makeRequest('/charities/');
    // Map each API object to match frontend interface
    const mapped: Charity[] = response.map((charity: any) => ({
      id: charity.id.toString(),
      name: charity.name,
      description: charity.description,
      walletAddress: charity.wallet_address,
      targetAmount: parseFloat(charity.target_amount),
      raisedAmount: parseFloat(charity.raised_amount),
      category: charity.category,
      status: charity.status,
      createdAt: charity.created_at,
      documents: {
        govId: charity.documents.gov_id,
        approvalDoc: charity.documents.approval_doc,
      },
      creator: {
        name: charity.creator.name,
        email: charity.creator.email,
        wallet_address: charity.creator.wallet_address,
      },
      onChainId: charity.on_chain_id,
    }));
    return mapped;
    } catch (error) {
      // Return mock data when API is not available
      console.warn('API not available, using mock charity data');
      return mockCharities;
    }
  }

static async updateCharityOnChainId(charityId: string, onChainId: string) {
  try {
    return await ApiService.makeRequest(`/charities/${charityId}/onchain/`, {
      method: 'POST',
      body: JSON.stringify({ on_chain_id: onChainId }),
    });
  } catch (error) {
    console.warn('API not available, could not update onChainId');
  }
}  

  async getCharity(id: string): Promise<Charity> {
    try {
      
      return await ApiService.makeRequest(`/charities/${id}/`);
    } catch (error) {
      // Return mock charity when API is not available
      console.warn('API not available, using mock charity data');
      const charity = mockCharities.find(c => c.id === id);
      if (!charity) {
        throw new Error('Charity not found');
      }
      return charity;
    }
  }

  // static async recordDonation(charityId: string, amount: number, txHash: string, donorAddress: string) {
  //   try {
  //     return await ApiService.makeRequest('/donations/', {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         charityId,
  //         amount,
  //         txHash,
  //         donorAddress,
  //       }),
  //     });
  //   } catch (error) {
  //     // Return mock success response when API is not available
  //     console.warn('API not available, using mock response for donation recording');
  //     return {
  //       id: Date.now().toString(),
  //       charityId,
  //       amount,
  //       txHash,
  //       donorAddress,
  //       createdAt: new Date().toISOString(),
  //     };
  //   }
  // }
  static async recordDonation(charityId: string, amount: number, txHash: string, donorAddress: string) {
  try {
    const payload = {
      charity_id: charityId,    // Changed from charityId
      amount: amount,
      tx_hash: txHash,          // Changed from txHash
      donor_address: donorAddress // Changed from donorAddress
    };
    
    console.log('Recording donation with payload:', payload);
    
    const result = await ApiService.makeRequest('/donations/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    console.log('Donation recorded successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to record donation:', error);
    // Return mock success response when API is not available
    console.warn('API not available, using mock response for donation recording');
    return {
      id: Date.now().toString(),
      charity_id: charityId,  // Changed from charityId
      amount,
      tx_hash: txHash,        // Changed from txHash
      donor_address: donorAddress, // Changed from donorAddress
      createdAt: new Date().toISOString(),
    };
  }
}
}

export const apiService = new ApiService();