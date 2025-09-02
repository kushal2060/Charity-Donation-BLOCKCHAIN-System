'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink,
  Shield,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ApiService, Charity } from '@/lib/api';
import { useWeb3 } from '@/hooks/useWeb3';
 import { toast } from 'sonner';
import { web3Service } from '@/lib/web3';


export default function AdminPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const { account } = useWeb3();

  // Mock admin addresses - in production, this would be managed server-side
  const adminAddresses = [
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
     // Replace with actual admin addresses
  ];
  
  

  const isAdmin = account && adminAddresses.includes(account);
  console.log("account:", account, "isAdmin:", isAdmin);
 
  useEffect(() => {
    const loadCharities = async () => {
      try {
        const data = await ApiService.getCharities();
        setCharities(data);
        
        // Calculate stats
        setStats({
          total: data.length,
          pending: data.filter(c => c.status === 'pending').length,
          approved: data.filter(c => c.status === 'approved').length,
          rejected: data.filter(c => c.status === 'rejected').length,
        });
      } catch (error) {
        console.error('Failed to load charities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharities();
  }, []);

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please connect your wallet to access the admin panel
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <CardTitle>Unauthorized Access</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleApproveCharity = async (charityId: string) => {
    try {
      // In a real implementation, this would call the backend API
      toast.success('Charity approved successfully');
      // Reload charities
      window.location.reload();
    } catch (error) {
      toast.error('Failed to approve charity');
    }
  };

  const handleRejectCharity = async (charityId: string) => {
    try {
      // In a real implementation, this would call the backend API
      toast.success('Charity rejected');
      // Reload charities
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reject charity');
    }
  };

  const CharityReviewCard = ({ charity }: { charity: Charity }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{charity.name}</CardTitle>
            <CardDescription className="mt-1">
              Created by: {charity.creator.name} ({charity.creator.email})
            </CardDescription>
          </div>
          <Badge 
            className={
              charity.status === 'approved' ? 'bg-green-100 text-green-800' :
              charity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }
          >
            {charity.status.charAt(0).toUpperCase() + charity.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Basic Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Category:</strong> {charity.category}</p>
              <p><strong>Target:</strong> {charity.targetAmount} ETH</p>
              <p><strong>Wallet:</strong> 
                <code className="ml-1 bg-muted px-1 py-0.5 rounded">
                  
                   {charity.walletAddress
                   ? `${charity.walletAddress.slice(0, 10)}...${charity.walletAddress.slice(-6)}`
                   : 'N/A'}
                </code>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Documents</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(charity.documents.govId, '_blank')}
                className="w-full justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Government ID
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(charity.documents.approvalDoc, '_blank')}
                className="w-full justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Approval Document
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{charity.description}</p>
        </div>
        <Button
            className="bg-blue-600 hover:bg-blue-700 mt-2"
            onClick={async () => {
              try {
                console.log("id:",charity.onChainId)

                if (charity.status === 'approved' && charity.onChainId !== undefined) {
                  await web3Service.verifyCharityOnChain(Number(charity.onChainId), true);
                } else {
                  toast.error('not approved');
                  return;
                }
                toast.success('Charity verified on-chain!');
                // Optionally, reload charities from backend
                window.location.reload();
              } catch (error) {
                toast.error('Failed to verify charity on-chain');
                console.error(error);
              }
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify On Chain
          </Button>

        {charity.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleApproveCharity(charity.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleRejectCharity(charity.id)}
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
        {/* {charity.status === 'approved' && charity.onChainId && (
          
          <Button
            className="bg-blue-600 hover:bg-blue-700 mt-2"
            onClick={async () => {
              try {
               
                if (charity.onChainId !== undefined) {
                  await web3Service.verifyCharityOnChain(Number(charity.onChainId), true);
                } else {
                  toast.error('Charity onChainId is missing');
                  return;
                }
                toast.success('Charity verified on-chain!');
                // Optionally, reload charities from backend
                window.location.reload();
              } catch (error) {
                toast.error('Failed to verify charity on-chain');
                console.error(error);
              }
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify On Chain
          </Button>
        )} */}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Review and manage charity applications
        </p>
      </div>

      {/* Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Admin Mode:</strong> You have administrative privileges to review and approve charity campaigns.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center">{stats.total}</CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              Total Charities
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-yellow-600">{stats.pending}</CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              Pending Review
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-green-600">{stats.approved}</CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Approved
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-red-600">{stats.rejected}</CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4" />
              Rejected
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Charity Reviews */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {charities.filter(c => c.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">All charity applications have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            charities
              .filter(c => c.status === 'pending')
              .map(charity => <CharityReviewCard key={charity.id} charity={charity} />)
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          {charities.filter(c => c.status === 'approved').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Approved Charities</h3>
                <p className="text-muted-foreground">No charities have been approved yet</p>
              </CardContent>
            </Card>
          ) : (
            charities
              .filter(c => c.status === 'approved')
              .map(charity => <CharityReviewCard key={charity.id} charity={charity} />)
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          {charities.filter(c => c.status === 'rejected').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rejected Applications</h3>
                <p className="text-muted-foreground">No charity applications have been rejected</p>
              </CardContent>
            </Card>
          ) : (
            charities
              .filter(c => c.status === 'rejected')
              .map(charity => <CharityReviewCard key={charity.id} charity={charity} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}