import React from 'react';
import { CardData, Player, BattleRecord } from '../types/game';
import { CardView } from './CardView';
import { Swords, Flame, Sparkles, RefreshCw, Crown, AlertTriangle } from 'lucide-react';

interface BattleArenaProps {
  challenger: Player | null;
  defender: Player | null;
  challengerCard: CardData | null;
  defenderCard: CardData | null;
  battleReveal: boolean;
  battleRecord: BattleRecord | null;
  isRevolution: boolean;
  deckCount: number;
  discardCount: number;
  onContinue?: () => void;
  waitingForPlayerAction?: boolean;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  challenger,
  defender,
  challengerCard,
  defenderCard,
  battleReveal,
  battleRecord,
  isRevolution,
  deckCount,
  discardCount,
  onContinue,
  waitingForPlayerAction = false,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-slate-950/90 via-emerald-950/20 to-slate-950/90 border border-emerald-900/40 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between min-h-[380px] sm:min-h-[420px] overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />

      {/* Revolution & Rules Banner at Top */}
      <div className="w-full flex items-center justify-between z-10 px-2 sm:px-4">
        {/* Revolution status banner */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all ${
            isRevolution
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-900/40 ring-1 ring-rose-400'
              : 'bg-slate-900/80 border-amber-900/50 text-amber-300'
          }`}
        >
          {isRevolution ? (
            <>
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>革命中！ 【 Z が最強 ＞ A が最弱 】</span>
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 text-amber-400" />
              <span>通常秩序 【 A が最強 ＞ Z が最弱 】</span>
            </>
          )}
        </div>

        {/* Deck & Graveyard counter */}
        <div className="flex items-center gap-3 text-xs font-mono text-stone-300">
          <div className="flex items-center gap-1.5 bg-slate-900/70 border border-amber-900/30 px-2.5 py-1 rounded-lg">
            <span className="text-amber-400 font-bold">山札:</span>
            <span className="tabular-nums font-bold">{deckCount}</span>
            <span className="text-stone-500">枚</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/70 border border-stone-800 px-2.5 py-1 rounded-lg">
            <span className="text-stone-400">墓地:</span>
            <span className="tabular-nums">{discardCount}</span>
            <span className="text-stone-500">枚</span>
          </div>
        </div>
      </div>

      {/* Arena Center Duel Field */}
      <div className="w-full my-auto flex flex-col items-center justify-center py-4 z-10">
        
        {/* Battle Slots */}
        <div className="flex items-center justify-center gap-6 sm:gap-14 w-full">
          
          {/* Challenger Slot */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-serif-jp text-amber-300 font-medium flex items-center gap-1">
              {challenger?.name ?? '挑戦者'}
              {battleRecord?.winnerId === challenger?.id && (
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              )}
            </span>
            <div className="transition-all duration-300">
              {challengerCard ? (
                <CardView
                  card={challengerCard}
                  faceDown={!battleReveal}
                  size="md"
                  isWinningClash={battleReveal && battleRecord?.winnerId === challenger?.id}
                />
              ) : (
                <div className="w-36 h-52 border-2 border-dashed border-stone-700/60 rounded-xl flex items-center justify-center bg-slate-900/30 text-stone-500 text-xs">
                  カード配置中...
                </div>
              )}
            </div>
          </div>

          {/* VS Center Marker */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/50">
              <Swords className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-cinzel text-xs font-bold text-amber-400/80 tracking-widest mt-1">
              VS
            </span>
          </div>

          {/* Defender Slot */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-serif-jp text-sky-300 font-medium flex items-center gap-1">
              {defender?.name ?? '防衛側'}
              {battleRecord?.winnerId === defender?.id && (
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              )}
            </span>
            <div className="transition-all duration-300">
              {defenderCard ? (
                <CardView
                  card={defenderCard}
                  faceDown={!battleReveal}
                  size="md"
                  isWinningClash={battleReveal && battleRecord?.winnerId === defender?.id}
                />
              ) : (
                <div className="w-36 h-52 border-2 border-dashed border-stone-700/60 rounded-xl flex items-center justify-center bg-slate-900/30 text-stone-500 text-xs">
                  カード配置中...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Battle Resolution & Effect Highlights */}
        {battleReveal && battleRecord && (
          <div className="mt-6 w-full max-w-lg flex flex-col items-center text-center gap-2 animate-in fade-in duration-300">
            {/* Special instant victory announce */}
            {battleRecord.instantWinWinnerId && (
              <div className="p-3 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-xl font-bold font-serif-jp shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base animate-bounce">
                <Crown className="w-5 h-5 text-slate-950" />
                <span>
                  【特異点勝利】
                  {battleRecord.instantWinWinnerId === challenger?.id ? challenger?.name : defender?.name}
                  の完全勝利！
                </span>
              </div>
            )}

            {/* Normal battle outcome banner */}
            <div className="p-2.5 px-4 bg-slate-900/90 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-stone-200 shadow-lg">
              <span className="font-bold text-amber-300">
                {battleRecord.winnerId === challenger?.id ? challenger?.name : defender?.name}
              </span>
              <span> の勝利！ </span>
              <span className="text-amber-400 font-mono font-bold">
                +{battleRecord.winnerId === challenger?.id ? defenderCard?.points : challengerCard?.points}pt
              </span>
              <span className="text-stone-400 text-xs ml-1">
                (敗者のカードを獲得)
              </span>
            </div>

            {/* Effects triggered list */}
            {battleRecord.effectsTriggered.length > 0 && (
              <div className="space-y-1 w-full">
                {battleRecord.effectsTriggered.map((effect, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 px-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{effect}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Continue Button */}
            {onContinue && waitingForPlayerAction && (
              <button
                onClick={onContinue}
                className="mt-2 px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-serif-jp text-sm rounded-xl shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <span>次へ進む</span>
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
