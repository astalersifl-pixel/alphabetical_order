import React from 'react';
import { CardData, Player, BattleRecord } from '../types/game';
import { CardView } from './CardView';
import {
  Swords,
  Flame,
  Sparkles,
  Crown,
  Zap,
  ShieldAlert,
  ChevronRight,
  ShieldCheck,
  Skull,
} from 'lucide-react';

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
  onStartClash?: () => void;
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
  onStartClash,
}) => {
  const isChallengerWinner = battleRecord?.winnerId === challenger?.id;
  const isDefenderWinner = battleRecord?.winnerId === defender?.id;

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between min-h-[420px] sm:min-h-[460px] overflow-hidden transition-colors duration-500 border ${
        isRevolution
          ? 'bg-gradient-to-b from-slate-950 via-rose-950/30 to-slate-950 border-rose-900/60 shadow-rose-950/40'
          : 'bg-gradient-to-b from-slate-950 via-emerald-950/20 to-slate-950 border-emerald-900/40 shadow-emerald-950/30'
      } ${battleReveal ? 'animate-clash-shake' : ''}`}
    >
      {/* Background ambient lighting */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isRevolution
            ? 'bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.12),transparent_70%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)]'
        }`}
      />

      {/* Clash Shockwave effect on reveal */}
      {battleReveal && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-amber-400/80 animate-shockwave pointer-events-none z-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-sky-400/60 animate-shockwave [animation-delay:150ms] pointer-events-none z-0" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_20px_#f59e0b] animate-slash-beam" />
          </div>
        </>
      )}

      {/* Top Bar: Revolution Status & Pile Counters */}
      <div className="w-full flex items-center justify-between z-10 px-2 sm:px-4">
        {/* Revolution status banner */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-serif-jp font-bold transition-all ${
            isRevolution
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-lg shadow-rose-900/50 ring-2 ring-rose-500/40 animate-pulse'
              : 'bg-slate-900/80 border-amber-900/60 text-amber-300'
          }`}
        >
          {isRevolution ? (
            <>
              <Flame className="w-4 h-4 text-rose-400 fill-rose-500 animate-bounce" />
              <span>革命発動中 【 Z が最強 ＞ A が最弱 】</span>
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 text-amber-400" />
              <span>通常秩序 【 A が最強 ＞ Z が最弱 】</span>
            </>
          )}
        </div>

        {/* Deck & Graveyard counter */}
        <div className="flex items-center gap-2.5 text-xs font-mono text-stone-300">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-900/40 px-2.5 py-1 rounded-lg shadow-sm">
            <span className="text-amber-400 font-bold">山札:</span>
            <span className="tabular-nums font-bold text-stone-100">{deckCount}</span>
            <span className="text-stone-500 text-[11px]">枚</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-stone-800 px-2.5 py-1 rounded-lg shadow-sm">
            <span className="text-stone-400">墓地:</span>
            <span className="tabular-nums text-stone-300">{discardCount}</span>
            <span className="text-stone-500 text-[11px]">枚</span>
          </div>
        </div>
      </div>

      {/* Arena Center Duel Field */}
      <div className="w-full my-auto flex flex-col items-center justify-center py-2 z-10">
        
        {/* Battle Slots Container */}
        <div className="relative flex items-center justify-center gap-5 sm:gap-14 w-full">
          
          {/* Challenger Slot */}
          <div className="flex flex-col items-center gap-2 relative">
            
            {/* Player Label & Victory Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-serif-jp text-amber-300 font-bold tracking-wide">
                {challenger?.name ?? '挑戦者'}
              </span>
              {battleReveal && isChallengerWinner && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-0.5 shadow-md">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>WIN</span>
                </span>
              )}
            </div>

            {/* Card Frame with Visual States */}
            <div
              className={`relative transition-all duration-300 ${
                battleReveal && isChallengerWinner
                  ? 'animate-winner-card z-20'
                  : battleReveal && battleRecord && !isChallengerWinner
                  ? 'animate-loser-card opacity-70 z-10'
                  : ''
              }`}
            >
              {challengerCard ? (
                <>
                  <CardView
                    card={challengerCard}
                    faceDown={!battleReveal}
                    size="md"
                    isWinningClash={battleReveal && isChallengerWinner}
                  />

                  {/* Winner score popup */}
                  {battleReveal && isChallengerWinner && defenderCard && (
                    <div className="absolute -top-3 -right-3 z-30 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black font-mono text-xs px-2.5 py-1 rounded-full shadow-xl border border-white/50 animate-bounce flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>+{defenderCard.points}pt 獲得</span>
                    </div>
                  )}

                  {/* Loser broken seal */}
                  {battleReveal && battleRecord && !isChallengerWinner && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="bg-rose-950/90 border border-rose-500 text-rose-300 font-serif-jp font-black text-xs px-3 py-1 rounded-md shadow-2xl -rotate-12 flex items-center gap-1">
                        <Skull className="w-3.5 h-3.5" />
                        <span>撃破 (奪取)</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-36 h-52 border-2 border-dashed border-amber-900/40 rounded-xl flex flex-col items-center justify-center bg-slate-950/40 text-stone-500 text-xs p-3 text-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-dashed border-amber-900/60 flex items-center justify-center text-amber-500/40">
                    ?
                  </div>
                  <span>カードを配置中...</span>
                </div>
              )}
            </div>

            <span className="text-[10px] text-amber-500/60 font-serif-jp">【先攻 / 攻撃側】</span>
          </div>

          {/* VS Center Marker & Clash Beam */}
          <div className="flex flex-col items-center justify-center px-1">
            <div
              className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all duration-300 ${
                battleReveal
                  ? 'bg-amber-500 border-amber-300 text-slate-950 scale-110 shadow-amber-500/50'
                  : 'bg-slate-900 border-amber-500/50 text-amber-400 shadow-amber-950/60'
              }`}
            >
              <Swords className={`w-6 h-6 sm:w-8 sm:h-8 ${battleReveal ? 'animate-spin [animation-iteration-count:1]' : 'animate-pulse'}`} />
            </div>

            <span className="font-cinzel text-xs font-black text-amber-400/90 tracking-widest mt-1">
              VS
            </span>

            {/* Clash Result compare label */}
            {battleReveal && challengerCard && defenderCard && (
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/80 border border-amber-500/30 font-cinzel text-[11px] font-bold text-amber-300 whitespace-nowrap shadow-md">
                {challengerCard.letter} {isChallengerWinner ? '＞' : '＜'} {defenderCard.letter}
              </div>
            )}
          </div>

          {/* Defender Slot */}
          <div className="flex flex-col items-center gap-2 relative">
            
            {/* Player Label & Victory Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-serif-jp text-sky-300 font-bold tracking-wide">
                {defender?.name ?? '防衛側'}
              </span>
              {battleReveal && isDefenderWinner && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-0.5 shadow-md">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>WIN</span>
                </span>
              )}
            </div>

            {/* Card Frame with Visual States */}
            <div
              className={`relative transition-all duration-300 ${
                battleReveal && isDefenderWinner
                  ? 'animate-winner-card z-20'
                  : battleReveal && battleRecord && !isDefenderWinner
                  ? 'animate-loser-card opacity-70 z-10'
                  : ''
              }`}
            >
              {defenderCard ? (
                <>
                  <CardView
                    card={defenderCard}
                    faceDown={!battleReveal}
                    size="md"
                    isWinningClash={battleReveal && isDefenderWinner}
                  />

                  {/* Winner score popup */}
                  {battleReveal && isDefenderWinner && challengerCard && (
                    <div className="absolute -top-3 -left-3 z-30 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black font-mono text-xs px-2.5 py-1 rounded-full shadow-xl border border-white/50 animate-bounce flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>+{challengerCard.points}pt 獲得</span>
                    </div>
                  )}

                  {/* Loser broken seal */}
                  {battleReveal && battleRecord && !isDefenderWinner && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="bg-rose-950/90 border border-rose-500 text-rose-300 font-serif-jp font-black text-xs px-3 py-1 rounded-md shadow-2xl rotate-12 flex items-center gap-1">
                        <Skull className="w-3.5 h-3.5" />
                        <span>撃破 (奪取)</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-36 h-52 border-2 border-dashed border-sky-900/40 rounded-xl flex flex-col items-center justify-center bg-slate-950/40 text-stone-500 text-xs p-3 text-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-dashed border-sky-900/60 flex items-center justify-center text-sky-500/40">
                    ?
                  </div>
                  <span>応戦待機中...</span>
                </div>
              )}
            </div>

            <span className="text-[10px] text-sky-500/60 font-serif-jp">【後攻 / 防衛側】</span>
          </div>

        </div>

        {/* "勝負する！" Button when both cards are placed and ready to reveal */}
        {!battleReveal && challengerCard && defenderCard && onStartClash && (
          <div className="mt-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 z-30">
            <button
              type="button"
              onClick={onStartClash}
              className="px-10 py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:via-rose-400 hover:to-amber-400 text-slate-950 font-black font-serif-jp text-base sm:text-lg rounded-2xl shadow-2xl shadow-rose-950/80 hover:shadow-amber-500/40 transition-all flex items-center gap-3 cursor-pointer group active:scale-95 animate-bounce ring-4 ring-amber-400/50"
            >
              <Swords className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              <span>いざ、勝負する！</span>
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </button>
            <span className="text-xs text-amber-300 font-serif-jp mt-2 animate-pulse font-medium">
              双方のカードが揃いました！ボタンを押してオープンしてください
            </span>
          </div>
        )}

        {/* Battle Dramatic Outcome & Effects Section */}
        {battleReveal && battleRecord && (
          <div className="mt-5 w-full max-w-lg flex flex-col items-center text-center gap-2.5 animate-in fade-in duration-300">
            
            {/* Special Instant Victory Banner */}
            {battleRecord.instantWinWinnerId && (
              <div className="p-3 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-2xl font-bold font-serif-jp shadow-2xl flex items-center justify-center gap-2 text-sm sm:text-base animate-bounce border-2 border-amber-200">
                <Crown className="w-5 h-5 fill-slate-950" />
                <span>
                  【特異点完全勝利】
                  {battleRecord.instantWinWinnerId === challenger?.id ? challenger?.name : defender?.name}
                  の宿命的勝利！
                </span>
              </div>
            )}

            {/* Normal Outcome Pill */}
            {!battleRecord.instantWinWinnerId && (
              <div className="p-2.5 px-5 bg-slate-900/95 border border-amber-500/40 rounded-2xl text-xs sm:text-sm text-stone-100 shadow-xl flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-amber-300">
                  {battleRecord.winnerId === challenger?.id ? challenger?.name : defender?.name}
                </span>
                <span>の勝利！</span>
                <span className="text-amber-400 font-mono font-bold">
                  +{battleRecord.winnerId === challenger?.id ? defenderCard?.points : challengerCard?.points}pt
                </span>
                <span className="text-stone-400 text-xs">
                  (相手のカードを獲得)
                </span>
              </div>
            )}

            {/* Effects triggered breakdown */}
            {battleRecord.effectsTriggered.length > 0 && (
              <div className="space-y-1.5 w-full">
                {battleRecord.effectsTriggered.map((effect, idx) => (
                  <div
                    key={idx}
                    className="p-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-bottom-1"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin [animation-iteration-count:1]" />
                    <span className="font-serif-jp font-medium">{effect}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Next Turn Button */}
            {onContinue && waitingForPlayerAction && (
              <button
                onClick={onContinue}
                className="mt-3 px-10 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-serif-jp text-sm rounded-2xl shadow-xl shadow-amber-950/60 hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer group active:scale-95"
              >
                <span>次のターンへ進む</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
