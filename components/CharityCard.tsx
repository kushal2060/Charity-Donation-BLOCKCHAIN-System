'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, ExternalLink, FileText, Shield } from 'lucide-react';
import { Charity } from '@/lib/api';
import { DonationDialog } from './DonationDialog';



interface CharityCardProps {
  charity: Charity;
}

export function CharityCard({ charity }: CharityCardProps) {
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const raisedAmount = charity.raisedAmount ?? 0;
  const targetAmount = charity.targetAmount ?? 1;
  
  const progressPercentage = (raisedAmount / targetAmount) * 100;
  const isFullyFunded = progressPercentage >= 100; // Add this check

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {charity.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {charity.description}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getStatusColor(charity.status)}>
                {charity.status.charAt(0).toUpperCase() + charity.status.slice(1)}
              </Badge>
              {charity.status === 'approved' && (
                <Shield className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {/* {charity.raisedAmount.toFixed(4)} / {charity.targetAmount} ETH */}  {raisedAmount.toFixed(4)} / {targetAmount} ETH

              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(1)}% funded
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(charity.documents.govId, '_blank')}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Gov ID
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(charity.documents.approvalDoc, '_blank')}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Approval
              </Button>
            </div>

            {charity.status === 'approved' && (
              <Button
                size="sm"
                onClick={() => setShowDonationDialog(true)}
                disabled={isFullyFunded} // Disable when fully funded
                className={`${
                  isFullyFunded 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                <Heart className="w-3 h-3 mr-1" />
                {isFullyFunded ? 'Fully Funded' : 'Donate'}
              </Button>
            )}
          </div>

          {/* Add funding status indicator */}
          {isFullyFunded && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Target Achieved!</span>
                <span>This charity has reached its funding goal.</span>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created by: {charity.creator.name}</span>
              <span>Category: {charity.category}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">Wallet:</span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                
                {charity.creator.wallet_address
                ? `${charity.creator.wallet_address.slice(0, 6)}...${charity.creator.wallet_address.slice(-4)}`
                 : 'N/A'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${charity.walletAddress}`, '_blank')}
                className="h-4 w-4 p-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DonationDialog
        charity={charity}
        open={showDonationDialog}
        onOpenChange={setShowDonationDialog}
        isFullyFunded={isFullyFunded} // Pass this to dialog
      />
    </>
  );
}