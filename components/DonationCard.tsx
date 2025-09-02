'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ExternalLink, 
  Shield, 
  TreePine, 
  Calendar,
  Hash,
  Wallet
} from 'lucide-react';
import { MerkleVerification } from './MerkleVerification';

interface DonationCardProps {
  donation: {
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
  };
  showCharityName?: boolean;
}

export function DonationCard({ donation, showCharityName = true }: DonationCardProps) {
  const [showMerkleDialog, setShowMerkleDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Donation #{donation.id}
              </CardTitle>
              {showCharityName && (
                <CardDescription className="mt-1">
                  To: {donation.charity.name}
                </CardDescription>
              )}
            </div>
            <Badge className={donation.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {donation.confirmed ? 'Confirmed' : 'Pending'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {parseFloat(donation.amount).toFixed(4)} ETH
            </div>
            <div className="text-sm text-muted-foreground">
              Donation Amount
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">From:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {formatAddress(donation.donor_address)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${donation.donor_address}`, '_blank')}
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tx:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {formatAddress(donation.tx_hash)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${donation.tx_hash}`, '_blank')}
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span>{formatDate(donation.created_at)}</span>
            </div>
          </div>

          {/* Actions */}
          {donation.confirmed && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => setShowMerkleDialog(true)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <TreePine className="w-4 h-4 mr-2" />
                Verify with Merkle Proof
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merkle Verification Dialog */}
      <Dialog open={showMerkleDialog} onOpenChange={setShowMerkleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Merkle Tree Verification
            </DialogTitle>
          </DialogHeader>
          <MerkleVerification
            donationId={donation.id}
            charityId={donation.charity.id}
            onClose={() => setShowMerkleDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}