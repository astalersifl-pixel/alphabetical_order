import React, { useState } from 'react';
import { Player, CardData } from '../types/game';
import { CardView } from './CardView';
import { Trophy, ShieldCheck, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface PublicCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer: Player | null;
  initialTab?: 'captured' | 'used';
}

export const PublicCardsModal: React.FC<PublicCardsModalProps> = ({
  isOpen,
  onClose,
  targetPlayer,
  initialTab = 'captured',
}) => {
  const [tab, setTab] = useState<'captured' | 'used'>(initialTab);

  if (!isOpen || !targetPlayer) return null;

  const cardsToShow = tab === 'captured' ? targetPlayer.capturedCards : targetPlayer.usedCards;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[88vh] text-stone-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-400/60 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {targetPlayer.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-serif-jp text-base font-bold text-stone-100 flex items-center gap-2">
                <span>{targetPlayer.name} の公開カード</span>
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                獲得合計: <span className="text-amber-400 font-bold">{targetPlayer.score}pt</span> · 使用済み: {targetPlayer.usedCards.length}枚
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 text-stone-400 hover:text-stone-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => {
              sound.playClick();
              setTab('captured');
            }}
            className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-serif-jp flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'captured'
                ? 'border-amber-400 bg-amber-950/50 text-amber-300 font-bold ring-1 ring-amber-400'
                : 'border-slate-800 bg-slate-950/60 text-stone-400 hover:border-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>獲得ポイントカード ({targetPlayer.capturedCards.length}枚)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('used');
            }}
            className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-serif-jp flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'used'
                ? 'border-sky-400 bg-sky-950/50 text-sky-300 font-bold ring-1 ring-sky-400'
                : 'border-slate-800 bg-slate-950/60 text-stone-400 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>使用済みカード ({targetPlayer.usedCards.length}枚)</span>
          </button>
        </div>

        {/* Cards Grid / List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {cardsToShow.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-stone-500 font-serif-jp">
              <span className="text-3xl mb-2">📭</span>
              <p className="text-sm">
                {tab === 'captured'
                  ? 'まだ相手から獲得したポイントカードはありません'
                  : 'まだバトルで使用したカードはありません'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cardsToShow.map((card, idx) => (
                <div key={`${card.letter}-${idx}`} className="flex flex-col items-center">
                  <CardView card={card} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-400 font-serif-jp">
          <span>※獲得ポイントカードおよび使用済みカードは誰でもいつでも確認可能です。</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 text-xs font-serif-jp cursor-pointer"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
};
