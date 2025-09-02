'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, User, LogOut } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { CreateProfileDialog } from './CreateProfileDialog';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function WalletConnect() {
  const { account, balance, isConnecting, userProfile, connectWallet } = useWeb3();
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    window.location.reload();
  };

  if (!account) {
    return (
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <div className="text-sm font-medium">
          {parseFloat(balance).toFixed(4)} ETH
        </div>
        <div className="text-xs text-muted-foreground">
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {userProfile ? userProfile.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userProfile?.name || 'Anonymous User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">
                  {parseFloat(balance).toFixed(4)} ETH
                </p>
                {userProfile && (
                  <Badge variant={userProfile.profileType === 'charity' ? 'default' : 'secondary'}>
                    {userProfile.profileType}
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!userProfile && (
            <DropdownMenuItem onClick={() => setShowCreateProfile(true)}>
              <User className="mr-2 h-4 w-4" />
              Create Profile
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDisconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateProfileDialog 
        open={showCreateProfile} 
        onOpenChange={setShowCreateProfile}
      />
    </div>
  );
}