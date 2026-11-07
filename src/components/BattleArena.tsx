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

  // Only participants (challenger or defender) can trigger clash actions (spectators watch auto-reveal)
  const isParticipant =
    !viewerPlayerId ||
    viewerPlayerId === challenger?.id ||
    viewerPlayerId === defender?.id;
  const isBothCpu = challenger?.type === 'cpu' && defender?.type === 'cpu';
  const canControl = isParticipant && !isBothCpu;
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

      {/* Top Bar: Pile Counters & Revolution Banner only if active */}
      <div className="w-full flex items-center justify-between z-10 px-1 sm:px-2 py-0.5 shrink-0">
        {/* Only show banner when Revolution is active */}
        {isRevolution ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-rose-500 bg-rose-950/90 text-rose-300 text-[10px] font-serif-jp font-bold shadow animate-pulse">
            <Flame className="w-3 h-3 text-rose-400 fill-rose-500 animate-bounce shrink-0" />
            <span>革命中 (Z最強)</span>
          </div>
        ) : (
          <div />
        )}

        {/* Deck & Graveyard counter + Quick Rules button */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-stone-300">
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              className="flex items-center gap-1 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/50 px-1.5 py-0.2 rounded-lg text-amber-300 text-[10px] font-serif-jp transition-colors cursor-pointer shrink-0"
              title="ルール解説を確認"
            >
              <HelpCircle className="w-2.5 h-2.5 text-amber-400" />
              <span>ルール</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-900/80 border border-amber-900/40 px-1.5 py-0.2 rounded-lg text-[10px]">
            <span className="text-amber-400 font-bold">山札:</span>
            <span className="tabular-nums font-bold text-stone-100">{deckCount}</span>
            <span className="text-stone-500 text-[9px]">枚</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 border border-stone-800 px-1.5 py-0.2 rounded-lg text-[10px]">
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
                  {onInspectCard && (battleReveal || viewerPlayerId === challenger?.id) && (
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

          {/* VS Center Marker & Battle Action Button */}
          <div className="flex flex-col items-center justify-center px-1 shrink-0 z-30 min-w-[72px] sm:min-w-[88px]">
            {!battleReveal && challengerCard && defenderCard && onStartClash ? (
              canControl ? (
                <button
                  type="button"
                  onClick={onStartClash}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black font-serif-jp text-xs sm:text-sm rounded-xl shadow-xl hover:shadow-amber-500/50 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 animate-bounce ring-2 ring-amber-400/60 whitespace-nowrap"
                  title="勝負を開示する"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>バトル！</span>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 text-[10px] font-serif-jp text-center shadow">
                  <div className="flex items-center gap-1 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span>対戦中</span>
                  </div>
                  <span className="text-[9px] text-stone-400 scale-90">待機中...</span>
                </div>
              )
            ) : (
              <>
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
              </>
            )}

            {/* Clash Result compare label */}
            {battleReveal && challengerCard && defenderCard && (
              <div className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/80 border border-amber-500/30 font-cinzel text-[10px] font-bold text-amber-300 whitespace-nowrap shadow-sm">
                {challengerCard.letter} {isChallengerWinner ? '＞' : '＜'} {defenderCard.letter}
              </div>
            )}

            {/* Direct Advance Button right beneath K > O (User Request) */}
            {battleReveal && battleRecord && (
              <div className="mt-1 flex flex-col items-center z-40">
                {/* Step 1: Proceed to Card Effects */}
                {!effectsResolved && (
                  canControl ? (
                    <button
                      type="button"
                      onClick={onResolveEffects}
                      className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-serif-jp text-[11px] rounded-lg shadow-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 animate-bounce ring-2 ring-emerald-400/50 whitespace-nowrap"
                    >
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>効果へ進む</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <div className="px-2 py-0.5 bg-slate-900/90 border border-emerald-500/40 rounded-lg text-emerald-300 font-serif-jp text-[9px] flex items-center gap-1 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>待機中...</span>
                    </div>
                  )
                )}

                {/* Step 2: Proceed to Next Turn */}
                {effectsResolved && onContinue && waitingForPlayerAction && (
                  <button
                    type="button"
                    onClick={onContinue}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-serif-jp text-[11px] rounded-lg shadow-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse ring-2 ring-amber-400/60 whitespace-nowrap"
                  >
                    <span>次へ進む</span>
                    {isBothCpu && <span className="text-[8px] font-normal opacity-75">(自動)</span>}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Defender Slot */}
          <div className="flex flex-col items-center gap-1 relative">
            <div className="flex items-center gap-1">
              <span className={`text-xs sm:text-sm font-serif-jp font-bold tracking-wide ${
                defender ? 'text-sky-300' : 'text-stone-400'
              }`}>
                {defender?.name ?? '相手を選択中...'}
              </span>
              {defender && !battleReveal && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600/90 border border-rose-400 text-white text-[9px] font-black uppercase flex items-center gap-0.5 shadow-sm animate-pulse">
                  <Swords className="w-2.5 h-2.5 fill-white" />
                  <span>対戦相手</span>
                </span>
              )}
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
                  {onInspectCard && (battleReveal || viewerPlayerId === defender?.id) && (
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
                <div className={`w-20 sm:w-24 h-28 sm:h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all ${
                  defender
                    ? 'border-rose-500/80 bg-rose-950/20 text-rose-300 ring-2 ring-rose-500/30 animate-pulse'
                    : 'border-sky-900/40 bg-slate-950/40 text-stone-500'
                }`}>
                  {defender ? (
                    <>
                      <Swords className="w-4 h-4 text-rose-400 mb-1 animate-bounce" />
                      <span className="text-[11px] font-bold text-rose-200 font-serif-jp">{defender.name}</span>
                      <span className="text-[9px] text-rose-300/80 mt-0.5">応戦カード選択中</span>
                    </>
                  ) : (
                    <span className="text-[10px]">相手未定</span>
                  )}
                </div>
              )}
            </div>

            <span className="text-[9px] text-sky-500/60 font-serif-jp">【後攻 / 防衛側】</span>
          </div>

        </div>

        {/* Battle Dramatic Outcome & Effects Section (Compact & Contained) */}
        {battleReveal && battleRecord && (
          <div className="mt-2 w-full max-w-md flex flex-col items-center text-center gap-1.5 animate-in fade-in duration-300 shrink-0">
            
            {/* Stage 1: Winner Announcement (Before Effects) */}
            {!effectsResolved && (
              <div className="w-full flex items-center justify-center">
                <div className="py-0.5 px-3 bg-slate-900/95 border border-amber-500/50 rounded-lg text-xs text-stone-100 shadow flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                  <span className="font-bold text-amber-300 font-serif-jp">
                    {battleRecord.winnerId === challenger?.id ? challenger?.name : defender?.name}
                  </span>
                  <span className="font-serif-jp">の勝利！</span>
                </div>
              </div>
            )}

            {/* Stage 2: Effects Breakdown */}
            {effectsResolved && (
              <>
                {/* Instant Victory */}
                {battleRecord.instantWinWinnerId && (
                  <div className="py-1 px-2.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-lg font-bold font-serif-jp shadow flex items-center justify-center gap-1 text-xs animate-bounce border border-amber-200">
                    <Crown className="w-3.5 h-3.5 fill-slate-950" />
                    <span>
                      【完全勝利】
                      {battleRecord.instantWinWinnerId === challenger?.id ? challenger?.name : defender?.name}
                      の勝利！
                    </span>
                  </div>
                )}

                {/* Normal Outcome Pill */}
                {!battleRecord.instantWinWinnerId && (
                  <div className="py-0.5 px-2.5 bg-slate-900/95 border border-amber-500/40 rounded-lg text-[11px] text-stone-100 shadow flex items-center gap-1.5">
                    <span className="font-bold text-amber-300">
                      {battleRecord.winnerId === challenger?.id ? challenger?.name : defender?.name}
                    </span>
                    <span>の勝利！</span>
                    <span className="text-amber-400 font-mono font-bold">
                      +{battleRecord.winnerId === challenger?.id ? defenderCard?.points : challengerCard?.points}pt
                    </span>
                    <span className="text-stone-400 text-[9px]">(獲得)</span>
                  </div>
                )}

                {/* Effects triggered breakdown (Scrollable if many) */}
                {battleRecord.effectsTriggered.length > 0 && (
                  <div className="max-h-[44px] overflow-y-auto space-y-0.5 w-full px-1">
                    {battleRecord.effectsTriggered.map((effect, idx) => (
                      <div
                        key={idx}
                        className="py-0.5 px-2 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[10px] flex items-center justify-center gap-1 shadow"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span className="font-serif-jp font-medium truncate">{effect}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
