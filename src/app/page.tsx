"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Footer } from "@/components/Footer";
import { LPPositionCard } from "@/components/LPPositionCard";
import { MigrationForm } from "@/components/MigrationForm";
import { MigratorStatus } from "@/components/MigratorStatus";
import { MigrateAllButton } from "@/components/MigrateAllButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useLPPositions, SUPPORTED_MIGRATIONS, type LPPosition } from "@/hooks/useLPPositions";
import { useMigratedPositions } from "@/hooks/useMigratedPositions";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { MigrationResult } from "@/hooks/useMigrate";

const FEE_TIER_LABELS: Record<number, string> = {
  100: "0.01%",
  500: "0.05%",
  2500: "0.25%",
  3000: "0.3%",
  10000: "1%",
};

export default function Home() {
  const { isConnected } = useAccount();
  const { positions, isLoading, error, refetch, supportedPairsCount } = useLPPositions();
  const { addMigratedPosition, refetch: refetchMigrated } = useMigratedPositions();
  const [selectedPosition, setSelectedPosition] = useState<LPPosition | null>(null);
  const [showPairs, setShowPairs] = useState(false);

  const handleMigrationSuccess = (result: MigrationResult) => {
    addMigratedPosition({
      tokenId: result.tokenId,
      token0: result.token0,
      token1: result.token1,
      fee: result.fee,
      tickLower: result.tickLower,
      tickUpper: result.tickUpper,
      liquidity: result.liquidity,
      txHash: result.txHash,
      pairName: result.pairName,
    });
    refetch();
    refetchMigrated();
    setSelectedPosition(null);
  };

  return (
    <div className="min-h-screen bg-[#050807] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a3820] bg-[#0a100a]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">
              <span className="text-[#cfff04]">PulseX</span>
              <span className="text-[#8aa860] mx-2">→</span>
              <span className="text-[#d9ff36]">9mm</span>
            </h1>
            <span className="text-xs text-[#8aa860] border-l border-[#2a3820] pl-3">V2 to V3 Migrator</span>
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus={{ smallScreen: "avatar", largeScreen: "full" }} />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Hero */}
        <div className="text-center mb-12 pt-4">
          <p className="text-[#8aa860] text-sm uppercase tracking-widest mb-4">PulseChain Liquidity Migration</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Migrate Your <span className="text-[#cfff04]">Liquidity</span>
          </h2>
          <p className="text-[#8aa860] max-w-md mx-auto text-base leading-relaxed">
            Move your <span className="text-white">PulseX V2</span> LP positions to <span className="text-white">9mm V3</span> with full-range liquidity — all in a single transaction.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#cfff04]"></span>
              <span className="text-[#8aa860]">{supportedPairsCount} Pairs Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d9ff36]"></span>
              <span className="text-[#8aa860]">No Platform Fee</span>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="max-w-md mx-auto">
            <Card className="bg-[#0a100a] border-[#2a3820]">
              <CardContent className="pt-10 pb-10 text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1a2310] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#cfff04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
                  <p className="text-[#8aa860] text-sm">Connect to view your LP positions</p>
                </div>
                <ConnectButton />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left - Positions */}
            <div className="lg:col-span-2 space-y-6">
              {/* V2 Positions Card */}
              <Card className="bg-[#0a100a] border-[#2a3820]">
                <div className="flex items-center justify-between p-4 border-b border-[#2a3820]">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">Your V2 Positions</h3>
                    {positions.length > 0 && (
                      <Badge className="bg-[#cfff04] text-[#050807] font-semibold">{positions.length}</Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="text-[#8aa860] hover:text-[#cfff04] hover:bg-[#1a2310]"
                  >
                    {isLoading ? "Scanning..." : "Refresh"}
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="py-12 text-center">
                      <div className="w-8 h-8 border-2 border-[#cfff04] border-t-transparent rounded-full mx-auto mb-3" style={{ animation: 'spin 1s linear infinite' }} />
                      <p className="text-[#8aa860] text-sm">Scanning wallet for LP positions...</p>
                      <p className="text-[#5a7040] text-xs mt-1">Checking {supportedPairsCount} supported pairs</p>
                    </div>
                  ) : error ? (
                    <Alert className="bg-red-500/10 border-red-500/20">
                      <AlertDescription className="text-red-400">{error.message}</AlertDescription>
                    </Alert>
                  ) : positions.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 mx-auto rounded-full bg-[#1a2310] flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-[#8aa860]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-white font-medium mb-1">No Positions Found</p>
                      <p className="text-[#8aa860] text-sm">You don&apos;t have LP tokens for supported pairs</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {positions.map((position) => (
                        <LPPositionCard
                          key={position.pairAddress}
                          position={position}
                          isSelected={selectedPosition?.pairAddress === position.pairAddress}
                          onSelect={() => setSelectedPosition(position)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Migrate All */}
              {positions.length >= 2 && (
                <MigrateAllButton
                  positions={positions}
                  slippage={1}
                  onSuccess={() => { refetch(); refetchMigrated(); }}
                />
              )}

              {/* Supported Pairs - Collapsible */}
              <div className="border border-[#2a3820] rounded-lg bg-[#0a100a]">
                <button
                  onClick={() => setShowPairs(!showPairs)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1a2310] transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8aa860]">Supported Pairs</span>
                    <Badge variant="outline" className="border-[#2a3820] text-[#8aa860] text-xs">{supportedPairsCount}</Badge>
                  </div>
                  <svg className={`w-4 h-4 text-[#8aa860] transition-transform ${showPairs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showPairs && (
                  <div className="px-4 pb-4 grid gap-2 max-h-60 overflow-y-auto">
                    {SUPPORTED_MIGRATIONS.map((pair) => (
                      <div key={pair.v2Pair} className="flex items-center justify-between py-2 px-3 rounded bg-[#1a2310]">
                        <span className="text-sm text-[#e2ff68]">{pair.name}</span>
                        <span className="text-xs text-[#8aa860]">{FEE_TIER_LABELS[pair.feeTier]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Form & Status */}
            <div className="space-y-6">
              <MigrationForm position={selectedPosition} onSuccess={handleMigrationSuccess} />
              <MigratorStatus />
            </div>
          </div>
        )}
      </main>

      <Footer />
      
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
