'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Download,
  TreePine,
  Hash,
  FileCheck
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { MerkleTree, merkleUtils, type MerkleProof } from '@/lib/merkle-tree';
import { toast } from 'sonner';

interface MerkleVerificationProps {
  donationId?: string;
  charityId?: string;
  onClose?: () => void;
}

export function MerkleVerification({ donationId, charityId, onClose }: MerkleVerificationProps) {
  const [proof, setProof] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualProof, setManualProof] = useState('');
  const [manualDonationId, setManualDonationId] = useState('');
  const [manualCharityId, setManualCharityId] = useState('');

  // Generate proof for a donation
  const generateProof = async () => {
    if (!donationId) {
      toast.error('Donation ID is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/donations/${donationId}/merkle-proof/`);

      if (!response.ok) {
        throw new Error('Failed to generate proof');
      }

      const data = await response.json();
      setProof(data);
      toast.success('Merkle proof generated successfully!');
    } catch (error) {
      console.error('Error generating proof:', error);
      toast.error('Failed to generate proof');
    } finally {
      setLoading(false);
    }
  };

  // Verify a proof
  const verifyProof = async (proofData?: any) => {
    const proofToVerify = proofData || proof;
    
    if (!proofToVerify) {
      toast.error('No proof to verify');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/donations/verify-merkle-proof/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donation_id: proofToVerify.donation_id,
          charity_id: proofToVerify.charity_id,
          merkle_proof: proofToVerify.merkle_proof
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify proof');
      }

      const result = await response.json();
      setVerificationResult(result);
      
      if (result.verification_result.verified) {
        toast.success('Proof verified successfully! ✅');
      } else {
        toast.error('Proof verification failed! ❌');
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
      toast.error('Failed to verify proof');
    } finally {
      setLoading(false);
    }
  };

  // Verify manual proof
  const verifyManualProof = async () => {
    if (!manualProof || !manualDonationId || !manualCharityId) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const proofData = JSON.parse(manualProof);
      const manualProofData = {
        donation_id: parseInt(manualDonationId),
        charity_id: parseInt(manualCharityId),
        merkle_proof: proofData
      };

      await verifyProof(manualProofData);
    } catch (error) {
      toast.error('Invalid proof format');
    }
  };

  // Copy proof to clipboard
  const copyProof = () => {
    if (proof) {
      navigator.clipboard.writeText(JSON.stringify(proof.merkle_proof, null, 2));
      toast.success('Proof copied to clipboard!');
    }
  };

  // Download proof as JSON
  const downloadProof = () => {
    if (proof) {
      const dataStr = JSON.stringify(proof, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `merkle-proof-donation-${proof.donation_id}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Proof downloaded!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <TreePine className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Merkle Tree Verification</h2>
        </div>
        <p className="text-muted-foreground">
          Cryptographically verify that your donation is included in the charity's records
        </p>
      </div>

      {/* Generate Proof Section */}
      {donationId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Generate Proof
            </CardTitle>
            <CardDescription>
              Generate a cryptographic proof for donation #{donationId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">Donation ID: {donationId}</Badge>
              {charityId && <Badge variant="outline">Charity ID: {charityId}</Badge>}
            </div>
            
            <Button 
              onClick={generateProof} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Merkle Proof'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Proof Display */}
      {proof && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-600" />
              Generated Proof
            </CardTitle>
            <CardDescription>
              Your cryptographic proof of donation inclusion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Proof Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Root Hash</Label>
                <div className="p-2 bg-muted rounded font-mono text-xs break-all">
                  {proof.merkle_proof.root}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Leaf Hash</Label>
                <div className="p-2 bg-muted rounded font-mono text-xs break-all">
                  {proof.merkle_proof.leaf}
                </div>
              </div>
            </div>

            {/* Tree Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label>Tree Depth</Label>
                <p className="font-semibold">{proof.tree_info.tree_depth}</p>
              </div>
              <div>
                <Label>Total Donations</Label>
                <p className="font-semibold">{proof.tree_info.total_leaves}</p>
              </div>
              <div>
                <Label>Proof Index</Label>
                <p className="font-semibold">{proof.merkle_proof.index}</p>
              </div>
              <div>
                <Label>Proof Length</Label>
                <p className="font-semibold">{proof.merkle_proof.proof.length}</p>
              </div>
            </div>

            {/* Proof Path */}
            <div className="space-y-2">
              <Label>Proof Path (Sibling Hashes)</Label>
              <div className="space-y-1">
                {proof.merkle_proof.proof.map((hash: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Level {index + 1}
                    </Badge>
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                      {hash}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => verifyProof()} disabled={loading}>
                <Shield className="w-4 h-4 mr-2" />
                Verify Proof
              </Button>
              <Button variant="outline" onClick={copyProof}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={downloadProof}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Manual Verification
          </CardTitle>
          <CardDescription>
            Verify any Merkle proof manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Donation ID</Label>
              <Input
                value={manualDonationId}
                onChange={(e) => setManualDonationId(e.target.value)}
                placeholder="Enter donation ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Charity ID</Label>
              <Input
                value={manualCharityId}
                onChange={(e) => setManualCharityId(e.target.value)}
                placeholder="Enter charity ID"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Merkle Proof (JSON)</Label>
            <Textarea
              value={manualProof}
              onChange={(e) => setManualProof(e.target.value)}
              placeholder="Paste Merkle proof JSON here..."
              rows={6}
              className="font-mono text-xs"
            />
          </div>

          <Button onClick={verifyManualProof} disabled={loading} className="w-full">
            Verify Manual Proof
          </Button>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.verification_result.verified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={verificationResult.verification_result.verified ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className="flex items-center gap-2">
                {verificationResult.verification_result.verified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <strong>Verification Successful!</strong> The donation is cryptographically proven to be included in the charity's records.
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <strong>Verification Failed!</strong> The proof could not be verified.
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <Label>Proof Structure Valid</Label>
                <Badge className={verificationResult.verification_result.proof_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {verificationResult.verification_result.proof_valid ? 'Valid' : 'Invalid'}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Root Hash Matches</Label>
                <Badge className={verificationResult.verification_result.root_matches ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {verificationResult.verification_result.root_matches ? 'Matches' : 'Mismatch'}
                </Badge>
              </div>
            </div>

            {/* Hash Comparison */}
            <div className="space-y-2">
              <Label>Current Tree Root</Label>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {verificationResult.verification_result.current_root}
              </code>
            </div>
            <div className="space-y-2">
              <Label>Provided Proof Root</Label>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {verificationResult.verification_result.provided_root}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How Merkle Tree Verification Works</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p>• <strong>Merkle Trees</strong> create a cryptographic fingerprint of all donations</p>
          <p>• <strong>Proofs</strong> allow verification without downloading all data</p>
          <p>• <strong>Root Hash</strong> represents the entire donation history</p>
          <p>• <strong>Verification</strong> is mathematically guaranteed and tamper-proof</p>
          <p>• <strong>Privacy</strong> is maintained - only your donation is revealed</p>
        </CardContent>
      </Card>
    </div>
  );
}