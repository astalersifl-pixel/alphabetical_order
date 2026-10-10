import React, { useEffect } from 'react';
import { CardData } from '../types/game';
import { ALL_LETTERS, CARD_DATABASE } from '../data/cards';
import { CardView } from './CardView';
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Flame,
  Crown,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface CardDetailModalProps {
  card: CardData | null;
  isOpen: boolean;
  onClose: () => void;
  isRevolution?: boolean;
  onSelectCard?: (card: CardData) => void;
  canPlayCard?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  isRevolution = false,
  onSelectCard,
  canPlayCard = false,
}) => {
  const [currentCard, setCurrentCard] = React.useState<CardData | null>(card);

  useEffect(() => {
    setCurrentCard(card);
  }, [card]);

  // Keyboard navigation & close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handleNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        handleNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentCard]);

  if (!isOpen || !currentCard) return null;

  const currentIndex = ALL_LETTERS.indexOf(currentCard.letter);

  const handleNavigate = (dir: 'prev' | 'next') => {
    sound.playCardFlip();
    let nextIdx = dir === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (nextIdx < 0) nextIdx = ALL_LETTERS.length - 1;
    if (nextIdx >= ALL_LETTERS.length) nextIdx = 0;
    setCurrentCard(CARD_DATABASE[ALL_LETTERS[nextIdx]]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg bg-gradient-to-b from-slate-900 via-stone-950 to-slate-950 border border-amber-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl text-stone-100 flex flex-col items-center max-h-[92vh] overflow-y-auto">
        
        {/* Top Header Row */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xl sm:text-2xl font-black text-amber-300">
              {currentCard.letter}
            </span>
            <div>
              <h3 className="font-serif-jp text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>{currentCard.japaneseName}</span>
                <span className="text-xs text-stone-400 font-cinzel">({currentCard.name})</span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="閉じる (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Artwork & Visual Presentation */}
        <div className="my-1 sm:my-2 relative flex items-center justify-center">
          <CardView card={currentCard} size="md" />
        </div>

        {/* Stat Badges Row */}
        <div className="flex items-center gap-2 flex-wrap justify-center my-2 text-xs font-serif-jp">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>得点: {currentCard.points} pt</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-medium">
            種別: {currentCard.category}
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-stone-700 text-stone-300 text-[11px]">
            {isRevolution ? (
              <>
                <Flame className="w-3 h-3 text-rose-400" />
                <span className="text-rose-300 font-bold">革命秩序: Z最強 ＞ A最弱</span>
              </>
            ) : (
              <>
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300 font-bold">通常秩序: A最強 ＞ Z最弱</span>
              </>
            )}
          </div>
        </div>

        {/* Card Effect Full Description Box */}
        <div className="w-full p-3 rounded-xl sm:rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 text-left my-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 mb-1 text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-500" />
            <span>カード特殊効果</span>
          </div>
          <p className="text-xs sm:text-sm font-serif-jp text-stone-100 leading-relaxed font-medium">
            {currentCard.description}
          </p>
        </div>

        {/* Lore / Flavor Text */}
        <div className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-stone-800 text-left my-1 text-xs text-stone-400 space-y-1">
          <div>
            <span className="font-semibold text-stone-300 text-[11px] block mb-0.5">伝承 (Lore):</span>
            <p className="italic leading-relaxed text-[11px] sm:text-xs">{currentCard.lore}</p>
          </div>
          {currentCard.flavorQuote && (
            <div className="pt-1 border-t border-white/5 text-amber-300/90 font-serif-jp text-[11px] sm:text-xs">
              「{currentCard.flavorQuote}」
            </div>
          )}
        </div>

        {/* Play Card Option (if opened from hand during selection) */}
        {canPlayCard && onSelectCard && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectCard(currentCard);
              onClose();
            }}
            className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-serif-jp text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>【 {currentCard.letter}: {currentCard.japaneseName} 】を手札から場に出す</span>
          </button>
        )}

        {/* Navigation & Close Footer */}
        <div className="w-full flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => handleNavigate('prev')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="前へ (←キー)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>前 (A〜Z)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-stone-600 text-stone-200 text-xs font-serif-jp transition-colors cursor-pointer text-center"
          >
            閉じる
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('next')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="次へ (→キー)"
          >
            <span>次 (A〜Z)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
