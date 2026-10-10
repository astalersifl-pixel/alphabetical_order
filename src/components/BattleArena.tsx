import React from 'react';
import { CardData, Player, BattleRecord } from '../types/game';
import { CardView } from './CardView';
import {
  Swords,
  Flame,
  Sparkles,
  Crown,
  ChevronRight,
  Skull,
  HelpCircle,
  Eye,
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
  viewerPlayerId?: string;
  onContinue?: () => void;
  waitingForPlayerAction?: boolean;
  onStartClash?: () => void;
  onResolveEffects?: () => void;
  onOpenRules?: () => void;
  onInspectCard?: (card: CardData) => void;
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
  viewerPlayerId,
  onContinue,
  waitingForPlayerAction = false,
  onStartClash,
  onResolveEffects,
  onOpenRules,
  onInspectCard,
}) => {
  const isChallengerWinner = battleRecord?.winnerId === challenger?.id;
  const isDefenderWinner = battleRecord?.winnerId === defender?.id;

  // Only participants (challenger or defender) or spectators watching 2 CPUs can trigger actions
  const isParticipant =
    !viewerPlayerId ||
    viewerPlayerId === challenger?.id ||
    viewerPlayerId === defender?.id;
  const isBothCpu = challenger?.type === 'cpu' && defender?.type === 'cpu';
  const canControl = isParticipant || isBothCpu;
  const effectsResolved = battleRecord?.effectsResolved ?? false;

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-md flex flex-col items-center justify-between flex-1 min-h-0 overflow-hidden transition-colors duration-500 border box-border ${
        isRevolution
          ? 'bg-gradient-to-b from-slate-950 via-rose-950/25 to-slate-950 border-rose-900/60 shadow-rose-950/40'
          : 'bg-gradient-to-b from-slate-950 via-emerald-950/15 to-slate-950 border-emerald-900/40 shadow-emerald-950/30'
      } ${battleReveal ? 'animate-clash-shake' : ''}`}
    >
      {/* Background ambient lighting */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isRevolution
            ? 'bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.1),transparent_70%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_70%)]'
        }`}
      />

      {/* Clash Shockwave effect on reveal */}
      {battleReveal && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-amber-400/80 animate-shockwave pointer-events-none z-0" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_20px_#f59e0b] animate-slash-beam" />
          </div>
        </>
      )}

      {/* Top Bar: Revolution Status & Pile Counters (Compact) */}
      <div className="w-full flex items-center justify-between z-10 px-1 sm:px-2 py-0.5 shrink-0">
        {/* Revolution status banner */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-serif-jp font-bold transition-all ${
            isRevolution
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500/40 animate-pulse'
              : 'bg-slate-900/80 border-amber-900/60 text-amber-300'
          }`}
        >
          {isRevolution ? (
            <>
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-500 animate-bounce shrink-0" />
              <span>革命発動中 【 Z最強 ＞ A最弱 】</span>
            </>
          ) : (
            <>
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>通常秩序 【 A最強 ＞ Z最弱 】</span>
            </>
          )}
        </div>

        {/* Deck & Graveyard counter + Quick Rules button */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-stone-300">
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              className="flex items-center gap-1 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/50 px-2 py-0.5 rounded-lg text-amber-300 text-[11px] font-serif-jp transition-colors cursor-pointer shrink-0"
              title="ルール解説を確認"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>ルール</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-900/80 border border-amber-900/40 px-2 py-0.5 rounded-lg text-[11px]">
            <span className="text-amber-400 font-bold">山札:</span>
            <span className="tabular-nums font-bold text-stone-100">{deckCount}</span>
            <span className="text-stone-500 text-[10px]">枚</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 border border-stone-800 px-2 py-0.5 rounded-lg text-[11px]">
            <span className="text-stone-400">墓地:</span>
            <span className="tabular-nums text-stone-300">{discardCount}</span>
          </div>
        </div>
      </div>

      {/* Center Battlefield: Cards & VS Zone (Compact & Flexible) */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-1 overflow-hidden min-h-0">
        
        <div className="w-full flex items-center justify-center gap-2 sm:gap-6">
          
          {/* Challenger Slot */}
          <div className="flex flex-col items-center gap-1 relative">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-serif-jp text-amber-300 font-bold tracking-wide">
                {challenger?.name ?? '挑戦者'}
              </span>
              {battleReveal && isChallengerWinner && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-0.5 shadow animate-pulse">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>WIN</span>
                </span>
              )}
            </div>

            {/* Challenger Card */}
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
                <div
                  className="relative group cursor-pointer"
                  onClick={() => {
                    if (battleReveal && onInspectCard) {
                      onInspectCard(challengerCard);
                    }
                  }}
                >
                  <CardView
                    card={challengerCard}
                    faceDown={!battleReveal}
                    size="sm"
                    isWinningClash={battleReveal && isChallengerWinner}
                  />

                  {/* Winner score popup */}
                  {battleReveal && isChallengerWinner && defenderCard && (
                    <div className="absolute -top-2.5 -right-2.5 z-30 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-lg border border-white/50 animate-bounce flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>+{defenderCard.points}pt 獲得</span>
                    </div>
                  )}

                  {/* Loser broken seal */}
                  {battleReveal && battleRecord && !isChallengerWinner && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="bg-rose-950/90 border border-rose-500 text-rose-300 font-serif-jp font-black text-[10px] px-2 py-0.5 rounded shadow-xl -rotate-12 flex items-center gap-1">
                        <Skull className="w-3 h-3" />
                        <span>撃破</span>
                      </div>
                    </div>
                  )}

                  {/* Enlarge inspect button */}
                  {battleReveal && onInspectCard && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectCard(challengerCard);
                      }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 px-1.5 py-0.2 rounded-full bg-slate-900/90 border border-amber-400 text-amber-300 font-serif-jp text-[9px] flex items-center gap-0.5 shadow-md hover:bg-amber-500 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                      title="別枠で拡大・詳細表示"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>詳細</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-20 sm:w-24 h-28 sm:h-36 border-2 border-dashed border-amber-900/40 rounded-lg flex flex-col items-center justify-center bg-slate-950/40 text-stone-500 text-[10px] p-2 text-center">
                  <span>カード配置中</span>
                </div>
              )}
            </div>

            <span className="text-[9px] text-amber-500/60 font-serif-jp">【先攻 / 攻撃側】</span>
          </div>

          {/* VS Center Marker */}
          <div className="flex flex-col items-center justify-center px-0.5 shrink-0">
            <div
              className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center shadow-lg transition-all duration-300 ${
                battleReveal
                  ? 'bg-amber-500 border-amber-300 text-slate-950 scale-105 shadow-amber-500/50'
                  : 'bg-slate-900 border-amber-500/50 text-amber-400'
              }`}
            >
              <Swords className={`w-4 h-4 sm:w-5 sm:h-5 ${battleReveal ? 'animate-spin [animation-iteration-count:1]' : 'animate-pulse'}`} />
            </div>

            <span className="font-cinzel text-[10px] font-black text-amber-400/90 tracking-widest mt-0.5">
              VS
            </span>

            {/* Clash Result compare label */}
            {battleReveal && challengerCard && defenderCard && (
              <div className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/80 border border-amber-500/30 font-cinzel text-[10px] font-bold text-amber-300 whitespace-nowrap shadow-sm">
                {challengerCard.letter} {isChallengerWinner ? '＞' : '＜'} {defenderCard.letter}
              </div>
            )}
          </div>

          {/* Defender Slot */}
          <div className="flex flex-col items-center gap-1 relative">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-serif-jp text-sky-300 font-bold tracking-wide">
                {defender?.name ?? '防衛側'}
              </span>
              {battleReveal && isDefenderWinner && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-0.5 shadow animate-pulse">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>WIN</span>
                </span>
              )}
            </div>

            {/* Defender Card */}
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
                <div
                  className="relative group cursor-pointer"
                  onClick={() => {
                    if (battleReveal && onInspectCard) {
                      onInspectCard(defenderCard);
                    }
                  }}
                >
                  <CardView
                    card={defenderCard}
                    faceDown={!battleReveal}
                    size="sm"
                    isWinningClash={battleReveal && isDefenderWinner}
                  />

                  {/* Winner score popup */}
                  {battleReveal && isDefenderWinner && challengerCard && (
                    <div className="absolute -top-2.5 -left-2.5 z-30 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-lg border border-white/50 animate-bounce flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>+{challengerCard.points}pt 獲得</span>
                    </div>
                  )}

                  {/* Loser broken seal */}
                  {battleReveal && battleRecord && !isDefenderWinner && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="bg-rose-950/90 border border-rose-500 text-rose-300 font-serif-jp font-black text-[10px] px-2 py-0.5 rounded shadow-xl rotate-12 flex items-center gap-1">
                        <Skull className="w-3 h-3" />
                        <span>撃破</span>
                      </div>
                    </div>
                  )}

                  {/* Enlarge inspect button */}
                  {battleReveal && onInspectCard && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectCard(defenderCard);
                      }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 px-1.5 py-0.2 rounded-full bg-slate-900/90 border border-amber-400 text-amber-300 font-serif-jp text-[9px] flex items-center gap-0.5 shadow-md hover:bg-amber-500 hover:text-slate-950 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                      title="別枠で拡大・詳細表示"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>詳細</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-20 sm:w-24 h-28 sm:h-36 border-2 border-dashed border-sky-900/40 rounded-lg flex flex-col items-center justify-center bg-slate-950/40 text-stone-500 text-[10px] p-2 text-center">
                  <span>応戦待機中</span>
                </div>
              )}
            </div>

            <span className="text-[9px] text-sky-500/60 font-serif-jp">【後攻 / 防衛側】</span>
          </div>

        </div>

        {/* Action Button: "勝負する！" */}
        {!battleReveal && challengerCard && defenderCard && onStartClash && (
          <div className="mt-2 sm:mt-3 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 z-30">
            {canControl ? (
              <button
                type="button"
                onClick={onStartClash}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black font-serif-jp text-xs sm:text-sm rounded-xl shadow-xl hover:shadow-amber-500/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95 animate-bounce ring-2 ring-amber-400/50"
              >
                <Swords className="w-4 h-4" />
                <span>いざ、勝負する！</span>
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </button>
            ) : (
              <div className="px-4 py-1.5 bg-slate-900/90 border border-amber-500/40 rounded-xl text-amber-200 font-serif-jp text-xs flex items-center gap-2 shadow">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>対戦者（{challenger?.name} vs {defender?.name}）の開示を待機中...</span>
              </div>
            )}
          </div>
        )}

        {/* Battle Dramatic Outcome & Effects Section (Compact & Contained) */}
        {battleReveal && battleRecord && (
          <div className="mt-2 w-full max-w-md flex flex-col items-center text-center gap-1.5 animate-in fade-in duration-300 shrink-0">
            
            {/* Stage 1: Card Reveal & Winner Announcement (Before Effects) */}
            {!effectsResolved && (
              <div className="w-full flex flex-col items-center gap-1.5">
                <div className="p-1.5 px-4 bg-slate-900/95 border border-amber-500/50 rounded-xl text-xs sm:text-sm text-stone-100 shadow-lg flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                  <span className="font-bold text-amber-300 font-serif-jp">
                    {battleRecord.winnerId === challenger?.id ? challenger?.name : defender?.name}
                  </span>
                  <span className="font-serif-jp font-bold">の勝利！</span>
                </div>

                {canControl ? (
                  <button
                    type="button"
                    onClick={onResolveEffects}
                    className="py-1.5 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-serif-jp text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-bounce ring-2 ring-emerald-400/40"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>カードの効果へ進む</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="px-4 py-1 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-emerald-200 font-serif-jp text-[11px] flex items-center gap-1.5 shadow">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>カード効果の発動を待機中...</span>
                  </div>
                )}
              </div>
            )}

            {/* Stage 2: Effects Breakdown & Next Turn Button */}
            {effectsResolved && (
              <>
                {/* Instant Victory */}
                {battleRecord.instantWinWinnerId && (
                  <div className="p-2 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-xl font-bold font-serif-jp shadow-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm animate-bounce border-2 border-amber-200">
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>
                      【特異点完全勝利】
                      {battleRecord.instantWinWinnerId === challenger?.id ? challenger?.name : defender?.name}
                      の宿命的勝利！
                    </span>
                  </div>
                )}

                {/* Normal Outcome Pill */}
                {!battleRecord.instantWinWinnerId && (
                  <div className="py-1 px-3 bg-slate-900/95 border border-amber-500/40 rounded-xl text-xs text-stone-100 shadow flex items-center gap-2">
                    <span className="font-bold text-amber-300">
                      {battleRecord.winnerId === challenger?.id ? challenger?.name : defender?.name}
                    </span>
                    <span>の勝利！</span>
                    <span className="text-amber-400 font-mono font-bold">
                      +{battleRecord.winnerId === challenger?.id ? defenderCard?.points : challengerCard?.points}pt
                    </span>
                    <span className="text-stone-400 text-[10px]">(獲得)</span>
                  </div>
                )}

                {/* Effects triggered breakdown (Scrollable if many) */}
                {battleRecord.effectsTriggered.length > 0 && (
                  <div className="max-h-[60px] sm:max-h-[80px] overflow-y-auto space-y-1 w-full px-1">
                    {battleRecord.effectsTriggered.map((effect, idx) => (
                      <div
                        key={idx}
                        className="py-1 px-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-center justify-center gap-1.5 shadow"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-serif-jp font-medium truncate">{effect}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next Turn Button */}
                {onContinue && waitingForPlayerAction && (
                  <button
                    type="button"
                    onClick={onContinue}
                    className="mt-0.5 py-1.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-serif-jp text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                  >
                    <span>次のターンへ進む</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
