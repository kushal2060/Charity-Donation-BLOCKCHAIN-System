'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Zap, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { CharityCard } from '@/components/CharityCard';
import { ApiService, Charity } from '@/lib/api';
import { useWeb3 } from '@/hooks/useWeb3';
import { web3Service } from '@/lib/web3';

export default function Home() {
  const [featuredCharities, setFeaturedCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCharities: 0,
    totalDonations: 0,
    totalAmount: 0,
  });
  const { account, userProfile } = useWeb3();

// In a global useEffect in page.tsx or App.tsx
// useEffect(() => {
//   const initWeb3 = async () => {
//     try {
//       await web3Service.connectWallet();
//       web3Service.setupContractEventListeners();
//     } catch (err) {
//       console.error("Web3 initialization failed:", err);
//     }
//   };
//   initWeb3();
// }, []);


  useEffect(() => {
    const loadData = async () => {
      try {
        const charities = await ApiService.getCharities();
        const approvedCharities = charities.filter(c => c.status === 'approved');
        console.log('Loaded charities:', approvedCharities);  
        setFeaturedCharities(approvedCharities.slice(0, 3));
        
        // Calculate stats
        setStats({
          totalCharities: approvedCharities.length,
          totalDonations: approvedCharities.reduce((sum, c) => sum + (Number(c.raisedAmount) > 0 ? 1 : 0), 0),
          totalAmount: approvedCharities.reduce((sum, c) => sum + Number(c.raisedAmount), 0),
        });
        console.log('Charity stats:', stats);
      } catch (error) {
        console.error('Failed to load charities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl mx-4 sm:mx-6 lg:mx-8" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Transparent Charity
            <br />
            <span className="text-3xl sm:text-5xl lg:text-6xl">Built on Blockchain</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Donate with confidence using Ethereum. Every transaction is transparent, secure, and recorded on the blockchain. Help verified charities make a real difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/charities">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8">
                <Heart className="mr-2 h-5 w-5" />
                Start Donating
              </Button>
            </Link>
            {account && userProfile?.profileType === 'charity' && (
              <Link href="/create-charity">
                <Button size="lg" variant="outline" className="px-8">
                  Create Charity
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-3xl font-bold">{stats.totalCharities}</CardTitle>
                <CardDescription>Verified Charities</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <CardTitle className="text-3xl font-bold">{stats.totalAmount.toFixed(2)} ETH</CardTitle>
                <CardDescription>Total Donated</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Heart className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <CardTitle className="text-3xl font-bold">{stats.totalDonations}</CardTitle>
                <CardDescription>Active Campaigns</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose ChariBlock?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform ensures transparency, security, and trust in every donation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle className="text-xl mb-2">Verified Charities</CardTitle>
                <CardDescription>
                  All charities undergo rigorous KYC verification with government ID and approval documents
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center p-6">
              <CardHeader>
                <Zap className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
                <CardTitle className="text-xl mb-2">Blockchain Transparency</CardTitle>
                <CardDescription>
                  Every donation is recorded on Ethereum blockchain, ensuring complete transparency and traceability
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center p-6">
              <CardHeader>
                <Heart className="w-12 h-12 mx-auto text-red-600 mb-4" />
                <CardTitle className="text-xl mb-2">Direct Impact</CardTitle>
                <CardDescription>
                  Your donations go directly to charity wallets without intermediaries, maximizing impact
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Charities Section */}
      {featuredCharities.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Charities</h2>
                <p className="text-muted-foreground">
                  Support verified charities making a difference
                </p>
              </div>
              <Link href="/charities">
                <Button variant="outline" className="flex items-center gap-2">
                  View All
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCharities.map((charity) => (
                <CharityCard key={charity.id} charity={charity} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our community of donors and charity creators building a more transparent future for charitable giving.
          </p>
          {!account ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">Connect your MetaMask wallet to get started</p>
              <Badge variant="outline" className="px-4 py-2">
                MetaMask Required
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/charities">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Explore Charities
                </Button>
              </Link>
              {userProfile?.profileType === 'charity' && (
                <Link href="/create-charity">
                  <Button size="lg" variant="outline">
                    Create Your Charity
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}