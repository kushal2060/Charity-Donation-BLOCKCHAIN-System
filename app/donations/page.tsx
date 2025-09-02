'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DonationCard } from '@/components/DonationCard';
import { MerkleVerification } from '@/components/MerkleVerification';
import { 
  Search, 
  Filter, 
  TreePine, 
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { apiService } from '@/lib/api';

interface Donation {
  id: string;
  charity: {
    id: string;
    name: string;
  };
  donor_address: string;
  amount: string;
  tx_hash: string;
  confirmed: boolean;
  created_at: string;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMerkleVerification, setShowMerkleVerification] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    totalAmount: 0,
    myDonations: 0
  });

  const { account } = useWeb3();

  useEffect(() => {
    const loadDonations = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/donations/list/');

        if (response.ok) {
          const data = await response.json();
          
          setDonations(data);
          setFilteredDonations(data);
          
          // Calculate stats
          const confirmed = data.filter((d: Donation) => d.confirmed);
          const myDonations = account ? data.filter((d: Donation) => 
            d.donor_address.toLowerCase() === account.toLowerCase()
          ) : [];
          
          setStats({
            total: data.length,
            confirmed: confirmed.length,
            totalAmount: confirmed.reduce((sum: number, d: Donation) => sum + parseFloat(d.amount), 0),
            myDonations: myDonations.length
          });
        }
      } catch (error) {
        console.error('Failed to load donations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, [account]);

  useEffect(() => {
    let filtered = donations;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(donation => 
        statusFilter === 'confirmed' ? donation.confirmed : !donation.confirmed
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(donation =>
        donation.charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.tx_hash.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by current user if connected
    if (account) {
      filtered = filtered.filter(donation => 
        donation.donor_address.toLowerCase() === account.toLowerCase()
      );
    }

    setFilteredDonations(filtered);
  }, [donations, searchTerm, statusFilter, account]);

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <TreePine className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your MetaMask wallet to view your donations
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Donations
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your donations and verify them using Merkle Tree cryptographic proofs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center">{stats.myDonations}</CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              My Donations
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-green-600">{stats.confirmed}</CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Confirmed
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center">{stats.totalAmount.toFixed(4)}</CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1">
              <DollarSign className="w-4 h-4" />
              Total ETH
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Button 
              onClick={() => setShowMerkleVerification(true)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <TreePine className="w-4 h-4 mr-2" />
              Merkle Verify
            </Button>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donations Grid */}
      {filteredDonations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TreePine className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No donations found</h3>
            <p className="text-muted-foreground">
              {donations.length === 0 
                ? "You haven't made any donations yet" 
                : "Try adjusting your filters"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <DonationCard key={donation.id} donation={donation} />
          ))}
        </div>
      )}

      {/* Merkle Verification Dialog */}
      {showMerkleVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Merkle Tree Verification</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMerkleVerification(false)}
                >
                  Close
                </Button>
              </div>
              <MerkleVerification onClose={() => setShowMerkleVerification(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}