import React, { useState } from 'react';
import { ALL_LETTERS, CARD_DATABASE } from '../data/cards';
import { CardCategory, CardData } from '../types/game';
import { CardView } from './CardView';
import { X, Search, Shield, Swords, Sparkles, Flame, Eye } from 'lucide-react';
import { sound } from '../utils/audio';

interface CardCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRevolution?: boolean;
}

export const CardCodexModal: React.FC<CardCodexModalProps> = ({
  isOpen,
  onClose,
  isRevolution = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<CardData>(CARD_DATABASE.A);

  if (!isOpen) return null;

  const cards = ALL_LETTERS.map((letter) => CARD_DATABASE[letter]);

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.letter.toLowerCase().includes(search.toLowerCase()) ||
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.japaneseName.includes(search) ||
      card.description.includes(search);

    const matchesCategory =
      selectedCategory === 'all' || card.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-amber-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-xl sm:text-2xl font-bold text-amber-400">
              Card Codex
            </span>
            <span className="text-xs text-amber-300/70 font-serif-jp">
              全26枚 カード大全集
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-amber-900/30 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="カード名、文字、効果で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-amber-900/40 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            {[
              { id: 'all', label: 'すべて (26)' },
              { id: 'special_wins', label: '特殊勝利 (B, Y)' },
              { id: 'end_game', label: 'ゲーム終了 (D)' },
              { id: 'hand_bonus', label: '手札加点 (A, C)' },
              { id: 'draw_on_loss', label: '敗北ドロー' },
              { id: 'steal', label: '手札強奪 (J, V, X)' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  sound.playClick();
                  if (filter.id === 'special_wins') {
                    setSearch('勝利する');
                    setSelectedCategory('all');
                  } else if (filter.id === 'end_game') {
                    setSearch('ゲームを終了');
                    setSelectedCategory('all');
                  } else if (filter.id === 'hand_bonus') {
                    setSearch('手札にあった場合');
                    setSelectedCategory('all');
                  } else if (filter.id === 'draw_on_loss') {
                    setSearch('1枚ドロー');
                    setSelectedCategory('all');
                  } else if (filter.id === 'steal') {
                    setSearch('加える');
                    setSelectedCategory('all');
                  } else {
                    setSearch('');
                    setSelectedCategory('all');
                  }
                }}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-amber-950/60 border border-amber-900/30 text-stone-300 hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Body (Grid + Detail Preview) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left / Bottom Card Grid */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 border-r border-amber-900/30">
            {filteredCards.map((card) => {
              const isSelected = selectedCard.letter === card.letter;
              return (
                <div
                  key={card.letter}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCard(card);
                  }}
                  className={`flex flex-col items-center cursor-pointer transition-transform ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <CardView
                    card={card}
                    size="sm"
                    selected={isSelected}
                    isPlayable={true}
                  />
                </div>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="w-full md:w-80 lg:w-96 p-6 bg-slate-950/70 overflow-y-auto flex flex-col items-center text-center">
            <div className="mb-4">
              <CardView card={selectedCard} size="md" />
            </div>

            <div className="w-full text-left space-y-4">
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
                <span className="text-stone-400 block mb-1">現在の強弱序列:</span>
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
    </div>
  );
};
