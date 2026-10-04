import React from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, HelpCircle, History } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderNavProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenCodex: () => void;
  onOpenRules: () => void;
  onOpenLog: () => void;
  onNewGame: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  isMuted,
  onToggleMute,
  onOpenCodex,
  onOpenRules,
  onOpenLog,
  onNewGame,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-amber-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <span className="font-cinzel text-lg sm:text-xl font-bold tracking-tight text-amber-400 whitespace-nowrap">
          Alphabetical Order
        </span>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-300">
        <button
          onClick={() => {
            sound.playClick();
            onOpenRules();
          }}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-400/80" />
          <span>ルール解説</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenCodex();
          }}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-400/80" />
          <span>カード図鑑 (A-Z)</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenLog();
          }}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <History className="w-4 h-4 text-amber-400/80" />
          <span>戦闘ログ</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile quick buttons */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenCodex();
          }}
          className="md:hidden p-2 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
          title="カード図鑑"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenLog();
          }}
          className="md:hidden p-2 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
          title="戦闘ログ"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Audio Mute button */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleMute();
          }}
          className="p-2 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
          title={isMuted ? 'サウンドON' : 'ミュート'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-stone-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* New Game Button */}
        <button
          onClick={() => {
            sound.playClick();
            onNewGame();
          }}
          className="px-3.5 py-1.5 text-xs font-serif-jp font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>新規対戦</span>
        </button>
      </div>

    </header>
  );
};
