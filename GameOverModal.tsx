import React from 'react';
import { Player } from '../types/game';
import { CardView } from './CardView';
import { Crown, Trophy, RotateCcw, BookOpen, Star, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  players: Player[];
  instantWinWinnerId?: string | null;
  instantWinReason?: string;
  onRestart: () => void;
  onOpenCodex: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  players,
  instantWinWinnerId,
  instantWinReason,
  onRestart,
  onOpenCodex,
}) => {
  if (!isOpen) return null;

  // Calculate scores and sort players
  const scoredPlayers = players.map((p) => {
    const hasAmateras = p.hand.some((c) => c.letter === 'A');
    const hasCrystalDragon = p.hand.some((c) => c.letter === 'C');
    const handBonus = (hasAmateras ? 10 : 0) + (hasCrystalDragon ? 5 : 0);
    const capturedPoints = p.capturedCards.reduce((acc, c) => acc + c.points, 0);
    const totalScore = capturedPoints + handBonus;

    return {
      player: p,
      capturedPoints,
      handBonus,
      hasAmateras,
      hasCrystalDragon,
      totalScore,
      isInstantWinner: instantWinWinnerId === p.id,
    };
  });

  // Sort: instant winner is 1st, then by total score descending
  scoredPlayers.sort((a, b) => {
    if (a.isInstantWinner) return -1;
    if (b.isInstantWinner) return 1;
    return b.totalScore - a.totalScore;
  });

  const winner = scoredPlayers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Crown & Victory Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 mb-3 shadow-lg shadow-amber-500/30 flex items-center justify-center">
            <Trophy className="w-9 h-9 text-slate-950" />
          </div>

          <span className="font-cinzel text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
            Game Set & Match
          </span>

          <h2 className="text-2xl sm:text-3xl font-black font-serif-jp text-white mb-1">
            勝者：{winner.player.name}！
          </h2>

          {instantWinWinnerId ? (
            <p className="text-xs sm:text-sm text-amber-300 font-medium bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-full mt-1">
              ✨ {instantWinReason || '特殊勝利条件達成による完全勝利！'}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-stone-400">
              獲得ポイント最上位により優勝！
            </p>
          )}
        </div>

        {/* Players Scoreboard Table */}
        <div className="space-y-4 mb-6">
          {scoredPlayers.map((entry, index) => {
            const isWinner = index === 0;
            return (
              <div
                key={entry.player.id}
                className={`p-4 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isWinner
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-stone-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                        {entry.player.name}
                        {isWinner && <Crown className="w-4 h-4 text-amber-400" />}
                      </h4>
                      <span className="text-xs text-stone-400">
                        獲得カード: {entry.player.capturedCards.length}枚
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-4 text-right">
                    <div className="text-xs text-stone-400">
                      <span>戦果: {entry.capturedPoints}pt</span>
                      {entry.handBonus > 0 && (
                        <span className="text-amber-400 ml-2">
                          +手札加点: {entry.handBonus}pt
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black font-mono text-amber-300 tabular-nums">
                      {entry.totalScore}
                      <span className="text-xs text-stone-400 font-normal ml-0.5">pt</span>
                    </div>
                  </div>
                </div>

                {/* Bonus tags */}
                {(entry.hasAmateras || entry.hasCrystalDragon) && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-xs">
                    {entry.hasAmateras && (
                      <span className="text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded text-[11px]">
                        ☀️ 太陽神(A) 手札所持ボーナス: +10pt
                      </span>
                    )}
                    {entry.hasCrystalDragon && (
                      <span className="text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded text-[11px]">
                        💎 クリスタルドラゴン(C) 手札所持ボーナス: +5pt
                      </span>
                    )}
                  </div>
                )}

                {/* Hand breakdown preview */}
                <div className="mt-3 flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[11px] text-stone-500 whitespace-nowrap mr-1">
                    最終手札:
                  </span>
                  {entry.player.hand.map((card) => (
                    <CardView key={card.letter} card={card} size="mini" />
                  ))}
                  {entry.player.hand.length === 0 && (
                    <span className="text-xs text-stone-600">手札なし</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-serif-jp text-sm rounded-xl shadow-lg shadow-amber-950/60 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            もう一度対戦する
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-stone-200 font-serif-jp text-sm rounded-xl border border-stone-700 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            カード図鑑を確認
          </button>
        </div>

      </div>
    </div>
  );
};
