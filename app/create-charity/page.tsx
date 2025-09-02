'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Shield, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { ApiService } from '@/lib/api';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const charitySchema = z.object({
  name: z.string().min(3, 'Charity name must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  targetAmount: z.string().min(1, 'Target amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Target amount must be a positive number'
  ),
  category: z.string().min(1, 'Please select a category'),
  govIdFile: z.any().refine((file) => file instanceof File, 'Government ID is required')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), 'File must be JPEG, PNG or PDF'),
  approvalDocFile: z.any().refine((file) => file instanceof File, 'Approval document is required')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), 'File must be JPEG, PNG or PDF'),
});

type CharityFormData = z.infer<typeof charitySchema>;

const categories = [
  'Education',
  'Healthcare',
  'Environment',
  'Poverty',
  'Disaster Relief',
  'Animal Welfare',
  'Human Rights',
  'Other'
];

export default function CreateCharityPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [approvalDocFile, setApprovalDocFile] = useState<File | null>(null);
  const router = useRouter();
  const { account, userProfile } = useWeb3();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CharityFormData>({
    resolver: zodResolver(charitySchema),
  });

  // Check if user is connected and has charity profile
  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
            <CardTitle>Wallet Required</CardTitle>
            <CardDescription>
              Please connect your MetaMask wallet to create a charity campaign
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
            <CardTitle>Profile Required</CardTitle>
            <CardDescription>
              Please create your profile first to access charity creation
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (userProfile.profileType !== 'charity') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only users with charity profiles can create charity campaigns
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleFileChange = (file: File | null, type: 'govId' | 'approvalDoc') => {
    if (type === 'govId') {
      setGovIdFile(file);
      if (file) {
        setValue('govIdFile', file);
      }
    } else {
      setApprovalDocFile(file);
      if (file) {
        setValue('approvalDocFile', file);
      }
    }
  };

  const onSubmit = async (data: CharityFormData) => {
    setIsSubmitting(true);
    try {
      await ApiService.createCharity({
        name: data.name,
        description: data.description,
        targetAmount: Number(data.targetAmount),
        category: data.category,
        walletAddress: account,
        creatorName: userProfile.name,
        creatorEmail: userProfile.email,
        govIdFile: data.govIdFile,
        approvalDocFile: data.approvalDocFile,
      });

      toast.success('Charity created successfully! It will be reviewed by our admin team.');
      router.push('/charities');
    } catch (error) {
      console.error('Failed to create charity:', error);
      toast.error('Failed to create charity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Charity Campaign
          </h1>
          <p className="text-muted-foreground">
            Submit your charity for review. All campaigns undergo KYC verification before approval.
          </p>
          <Badge className="bg-blue-100 text-blue-800">
            Connected as: {userProfile.name}
          </Badge>
        </div>

        {/* KYC Information */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>KYC Verification Required:</strong> Your charity will be manually reviewed by our admin team. 
            Please ensure all documents are clear and valid. This process typically takes 1-3 business days.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Charity Details</CardTitle>
            <CardDescription>
              Provide comprehensive information about your charity campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Charity Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter charity name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount (ETH) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.001"
                  {...register('targetAmount')}
                  placeholder="0.5"
                />
                {errors.targetAmount && (
                  <p className="text-sm text-red-600">{errors.targetAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your charity's mission, goals, and how donations will be used..."
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Required Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Government ID */}
                  <div className="space-y-2">
                    <Label>Government ID *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'govId')}
                        className="hidden"
                        id="govId"
                      />
                      <label htmlFor="govId" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {govIdFile ? govIdFile.name : 'Click to upload Government ID'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPEG, PNG or PDF (max 5MB)
                        </p>
                      </label>
                    </div>
                    {errors.govIdFile && (
                      <p className="text-sm text-red-600">{errors.govIdFile.message}</p>
                    )}
                  </div>

                  {/* Approval Document */}
                  <div className="space-y-2">
                    <Label>Government Approval Document *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'approvalDoc')}
                        className="hidden"
                        id="approvalDoc"
                      />
                      <label htmlFor="approvalDoc" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {approvalDocFile ? approvalDocFile.name : 'Click to upload Approval Document'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPEG, PNG or PDF (max 5MB)
                        </p>
                      </label>
                    </div>
                    {errors.approvalDocFile && (
                      <p className="text-sm text-red-600">{errors.approvalDocFile.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="w-5 h-5" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="space-y-2">
              <li>• Your charity will be submitted for admin review</li>
              <li>• Documents will be stored securely on IPFS</li>
              <li>• Manual KYC verification will be performed</li>
              <li>• You'll be notified of the approval status</li>
              <li>• Once approved, your charity will be live for donations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}