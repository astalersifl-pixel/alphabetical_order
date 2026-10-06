import React, { useState, useEffect } from 'react';
import { ALL_LETTERS, CARD_DATABASE } from '../data/cards';
import { CardCategory, CardData, Letter } from '../types/game';
import { CardView } from './CardView';
import {
  X,
  Search,
  Shield,
  Swords,
  Sparkles,
  Flame,
  Eye,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Crown,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface CardCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRevolution?: boolean;
  onOpenCustomImages?: () => void;
  onOpenRules?: () => void;
}

export const CardCodexModal: React.FC<CardCodexModalProps> = ({
  isOpen,
  onClose,
  isRevolution = false,
  onOpenCustomImages,
  onOpenRules,
}) => {
  const [search, setSearch] = useState('');
  const [activeFilterId, setActiveFilterId] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<CardData>(CARD_DATABASE.A);
  const [zoomedCard, setZoomedCard] = useState<CardData | null>(null);

  // Close zoomed modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedCard) {
          setZoomedCard(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedCard, isOpen, onClose]);

  if (!isOpen) return null;

  const cards = ALL_LETTERS.map((letter) => CARD_DATABASE[letter]);

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      !search ||
      card.letter.toLowerCase().includes(search.toLowerCase()) ||
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.japaneseName.includes(search) ||
      card.description.includes(search);

    let matchesFilter = true;
    if (activeFilterId === 'special_wins') {
      matchesFilter = ['B', 'Y'].includes(card.letter);
    } else if (activeFilterId === 'end_game') {
      matchesFilter = ['D'].includes(card.letter);
    } else if (activeFilterId === 'hand_bonus') {
      matchesFilter = ['A', 'C'].includes(card.letter);
    } else if (activeFilterId === 'draw_on_loss') {
      matchesFilter = ['E', 'H', 'I', 'K', 'M', 'N', 'S'].includes(card.letter);
    } else if (activeFilterId === 'steal') {
      matchesFilter = ['J', 'V', 'X'].includes(card.letter);
    }

    return matchesSearch && matchesFilter;
  });

  // Navigate to previous/next card in zoomed overlay
  const handleNavigateZoom = (direction: 'prev' | 'next') => {
    if (!zoomedCard) return;
    const currentIndex = ALL_LETTERS.indexOf(zoomedCard.letter);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = ALL_LETTERS.length - 1;
    if (newIndex >= ALL_LETTERS.length) newIndex = 0;
    const nextLetter = ALL_LETTERS[newIndex];
    sound.playCardFlip();
    setZoomedCard(CARD_DATABASE[nextLetter]);
    setSelectedCard(CARD_DATABASE[nextLetter]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[90vh] bg-slate-900 border border-amber-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-amber-900/40 bg-slate-950/80">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-cinzel text-lg sm:text-2xl font-bold text-amber-400">
              Card Codex
            </span>
            <span className="text-[11px] sm:text-xs text-amber-300/70 font-serif-jp">
              全26枚 カードリスト
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenRules && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenRules();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 text-xs font-bold font-serif-jp flex items-center gap-1 transition-colors cursor-pointer"
                title="ルール解説を開く"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">ルール解説</span>
              </button>
            )}

            {onOpenCustomImages && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCustomImages();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold font-serif-jp flex items-center gap-1 transition-colors cursor-pointer"
                title="自作カード画像の設定"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">自作画像</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-2.5 sm:p-4 border-b border-amber-900/30 bg-slate-950/40 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="カード名、文字、効果で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-amber-900/40 rounded-lg text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] sm:text-xs py-0.5 max-w-full">
            {[
              { id: 'all', label: 'すべて (26)' },
              { id: 'special_wins', label: '特殊勝利 (B, Y)' },
              { id: 'end_game', label: 'ゲーム終了 (D)' },
              { id: 'hand_bonus', label: '手札加点 (A, C)' },
              { id: 'draw_on_loss', label: '敗北ドロー' },
              { id: 'steal', label: '手札強奪 (J, V, X)' },
            ].map((filter) => {
              const isActive = activeFilterId === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveFilterId(filter.id);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-serif-jp transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 hover:bg-amber-950/60 border border-amber-900/30 text-stone-300 hover:text-amber-300'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body (Grid + Detail Preview) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Card Grid with "Tap to Zoom" Instruction */}
          <div className="flex-1 p-2.5 sm:p-4 overflow-y-auto">
            <div className="mb-2 text-center text-xs text-amber-300/80 font-serif-jp flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>カードをタップすると拡大表示して詳細を確認できます</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5">
              {filteredCards.map((card) => {
                const isSelected = selectedCard.letter === card.letter;
                return (
                  <div
                    key={card.letter}
                    onClick={() => {
                      sound.playCardFlip();
                      setSelectedCard(card);
                      setZoomedCard(card);
                    }}
                    className={`flex flex-col items-center cursor-pointer transition-transform group relative ${
                      isSelected ? 'scale-102 ring-2 ring-amber-400/60 rounded-xl' : 'hover:scale-102'
                    }`}
                  >
                    <CardView
                      card={card}
                      size="sm"
                      selected={isSelected}
                      isPlayable={true}
                    />
                    <div className="mt-1 text-center w-full">
                      <span className="text-[11px] font-bold text-amber-300 font-cinzel block">
                        {card.letter}: {card.japaneseName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Detail Pane (Visible on md and above) */}
          <div className="hidden md:flex w-80 lg:w-96 p-6 bg-slate-950/70 border-l border-amber-900/30 overflow-y-auto flex-col items-center text-center">
            <div
              className="mb-4 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                sound.playClick();
                setZoomedCard(selectedCard);
              }}
              title="クリックして拡大表示"
            >
              <CardView card={selectedCard} size="md" />
              <span className="text-[10px] text-amber-400/80 block mt-1.5 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" />
                <span>クリックで特大表示</span>
              </span>
            </div>

            <div className="w-full text-left space-y-3.5">
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold font-serif-jp text-amber-300">
                    {selectedCard.letter}: {selectedCard.name}
                  </h3>
                  <span className="font-mono text-base font-bold text-amber-400">
                    {selectedCard.points} pt
                  </span>
                </div>
                <p className="text-sm text-stone-300 font-serif-jp">
                  ～{selectedCard.japaneseName}～
                </p>
              </div>

              {/* Strength under current state */}
              <div className="p-2.5 rounded bg-slate-900 border border-amber-900/40 text-xs">
                <span className="text-stone-400 block mb-0.5">現在の強弱序列:</span>
                <p className="text-amber-200 font-medium">
                  {isRevolution
                    ? `革命発動中：Z が最強、A が最弱（ランク: ${selectedCard.letter}）`
                    : `通常秩序：A が最強、Z が最弱（ランク: ${selectedCard.letter}）`}
                </p>
              </div>

              {/* Effect Description */}
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-left">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  カード効果
                </span>
                <p className="text-xs sm:text-sm text-stone-100 font-serif-jp leading-relaxed">
                  {selectedCard.description}
                </p>
              </div>

              {/* Strategy & Lore */}
              <div className="text-left space-y-1 text-xs text-stone-400">
                <span className="font-medium text-stone-300">伝承 (Lore):</span>
                <p className="italic leading-relaxed">{selectedCard.lore}</p>
                {selectedCard.flavorQuote && (
                  <p className="text-amber-400/80 pt-1">
                    「{selectedCard.flavorQuote}」
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* Zoom Detail Overlay Modal with Prominent '×' Close Button */}
      {/* ========================================================= */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-150"
          onClick={() => setZoomedCard(null)}
        >
          <div
            className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center max-h-[94vh] overflow-y-auto box-border text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Card Title and Prominent '×' Button */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-amber-900/50">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400 font-cinzel font-black text-base shadow">
                  {zoomedCard.letter}
                </span>
                <div>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-300 flex items-center gap-1.5 leading-none">
                    <span>{zoomedCard.name}</span>
                  </h3>
                  <span className="font-serif-jp text-xs text-stone-300">
                    ～{zoomedCard.japaneseName}～
                  </span>
                </div>
              </div>

              {/* Prominent Close '×' Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setZoomedCard(null);
                }}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-950/80 border border-stone-600 hover:border-rose-500 text-stone-300 hover:text-rose-200 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow"
                title="閉じる (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Card Artwork Display */}
            <div className="my-2 relative flex items-center justify-center">
              <CardView card={zoomedCard} size="lg" />
            </div>

            {/* Stat Badges Row */}
            <div className="flex items-center gap-2 flex-wrap justify-center my-2 text-xs font-serif-jp">
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold font-mono">
                得点: {zoomedCard.points} pt
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-medium">
                種別: {zoomedCard.category}
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-800 border border-stone-700 text-stone-300">
                {isRevolution ? '革命序列: Z最強 ＞ A最弱' : '通常秩序: A最強 ＞ Z最弱'}
              </div>
            </div>

            {/* Card Effect Highlight Box */}
            <div className="w-full p-3.5 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 text-left my-2 shadow-inner">
              <div className="flex items-center gap-1.5 mb-1 text-amber-400 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-500" />
                <span>カード効果</span>
              </div>
              <p className="text-sm font-serif-jp text-stone-100 leading-relaxed font-medium">
                {zoomedCard.description}
              </p>
            </div>

            {/* Lore & Flavor Quote */}
            <div className="w-full p-3 rounded-xl bg-slate-950/60 border border-stone-800 text-left my-1 text-xs text-stone-400 space-y-1">
              <div>
                <span className="font-semibold text-stone-300 block mb-0.5">伝承 (Lore):</span>
                <p className="italic leading-relaxed">{zoomedCard.lore}</p>
              </div>
              {zoomedCard.flavorQuote && (
                <div className="pt-1 border-t border-white/5 text-amber-300/90 font-serif-jp">
                  「{zoomedCard.flavorQuote}」
                </div>
              )}
            </div>

            {/* Navigation & Action Footer */}
            <div className="w-full flex items-center justify-between gap-3 mt-4 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => handleNavigateZoom('prev')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-serif-jp transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>前のカード</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setZoomedCard(null);
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-serif-jp text-xs sm:text-sm shadow-md transition-all cursor-pointer text-center"
              >
                × 閉じる
              </button>

              <button
                type="button"
                onClick={() => handleNavigateZoom('next')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-serif-jp transition-colors cursor-pointer"
              >
                <span>次のカード</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
