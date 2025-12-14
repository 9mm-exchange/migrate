"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMigratorInfo } from "@/hooks/useMigratorInfo";
import { NINEMM_CONTRACTS, TOKENS, EXPLORER } from "@/constants/addresses";

export function MigratorStatus() {
  const { weth9, positionManager, isLoading, isValid } = useMigratorInfo();

  return (
    <Card className="bg-[#0a100a] border-[#2a3820]">
      <div className="flex items-center justify-between p-4 border-b border-[#2a3820]">
        <h3 className="text-sm text-[#8aa860]">Contract Status</h3>
        {!isLoading && (
          <span className={`text-xs px-2 py-0.5 rounded ${isValid ? 'bg-[#cfff04]/10 text-[#cfff04]' : 'bg-red-500/10 text-red-400'}`}>
            {isValid ? "Ready" : "Error"}
          </span>
        )}
      </div>
      
      <CardContent className="p-4 space-y-2 text-xs">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[#8aa860]">
            <div className="w-3 h-3 border border-[#2a3820] border-t-[#cfff04] rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
            Checking...
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-[#8aa860]">Migrator</span>
              <a href={EXPLORER.address(NINEMM_CONTRACTS.V3_MIGRATOR)} target="_blank" rel="noopener noreferrer" className="text-[#cfff04] hover:underline font-mono">
                {NINEMM_CONTRACTS.V3_MIGRATOR.slice(0, 6)}...{NINEMM_CONTRACTS.V3_MIGRATOR.slice(-4)}
              </a>
            </div>
            {weth9 && (
              <div className="flex justify-between">
                <span className="text-[#8aa860]">WPLS</span>
                <span className={weth9.toLowerCase() === TOKENS.WPLS.toLowerCase() ? 'text-[#cfff04]' : 'text-red-400'}>
                  {weth9.toLowerCase() === TOKENS.WPLS.toLowerCase() ? '✓' : '✕'}
                </span>
              </div>
            )}
            {positionManager && (
              <div className="flex justify-between">
                <span className="text-[#8aa860]">NFT Manager</span>
                <span className={positionManager.toLowerCase() === NINEMM_CONTRACTS.POSITION_MANAGER.toLowerCase() ? 'text-[#cfff04]' : 'text-red-400'}>
                  {positionManager.toLowerCase() === NINEMM_CONTRACTS.POSITION_MANAGER.toLowerCase() ? '✓' : '✕'}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Card>
  );
}
