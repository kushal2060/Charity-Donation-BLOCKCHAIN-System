'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ExternalLink } from 'lucide-react';
import { Charity } from '@/lib/api';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import { ApiService } from '@/lib/api';

const donationSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  message: z.string().max(200, 'Message must be less than 200 characters').optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationDialogProps {
  charity: Charity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFullyFunded: boolean;
}

export function DonationDialog({ charity, open, onOpenChange }: DonationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { sendDonation, account, balance } = useWeb3();
  const raisedAmount = charity.raisedAmount ?? 0;
  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: '',
      message: '',
    },
  });

  const onSubmit = async (data: DonationFormData) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Send donation through smart contract
      const hash = await sendDonation(
        parseInt(charity.onChainId!), 
        data.amount, 
        data.message || ""
      );
      setTxHash(hash);

      // Also record in backend for tracking
      try {
        await ApiService.recordDonation(
          charity.id,
          Number(data.amount),
          hash,
          account
        );
      } catch (error) {
        console.warn('Failed to record donation in backend:', error);
        // Don't fail the transaction if backend recording fails
      }

      toast.success('Donation sent successfully!');
      form.reset();
    } catch (error: any) {
      console.error('Failed to send donation:', error);
      
      // Handle specific error messages
      if (error.message?.includes('user rejected')) {
        toast.error('Transaction was cancelled');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for this transaction');
      } else {
        toast.error('Failed to send donation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTxHash(null);
    form.reset();
    onOpenChange(false);
  };

  if (txHash) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600" />
              Donation Successful!
            </DialogTitle>
            <DialogDescription>
              Your donation has been sent successfully. Thank you for your generosity!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Transaction Hash</span>
                <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                  {txHash}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Donate to {charity.name}
          </DialogTitle>
          <DialogDescription>
            Send ETH directly to this charity via smart contract. Your donation will be recorded on the blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Target:</span>
                <p className="font-medium">{charity.targetAmount} ETH</p>
              </div>
              <div>
                <span className="text-muted-foreground">Raised:</span>
                <p className="font-medium">{raisedAmount.toFixed(4)} ETH</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Your Balance:</span>
                <p className="font-medium">{parseFloat(balance).toFixed(4)} ETH</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation Amount (ETH)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="0.001"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Leave a message for the charity..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !account}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? 'Sending...' : 'Send Donation'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <strong>Note:</strong> A 2.5% platform fee will be deducted from your donation to support the platform.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}