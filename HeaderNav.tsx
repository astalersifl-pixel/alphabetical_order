import React from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, HelpCircle, History, Image as ImageIcon } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderNavProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenCodex: () => void;
  onOpenRules: () => void;
  onOpenLog: () => void;
  onNewGame: () => void;
  onlineRoomCode?: string;
  onCopyRoomCode?: () => void;
  onOpenCustomImages?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  isMuted,
  onToggleMute,
  onOpenCodex,
  onOpenRules,
  onOpenLog,
  onNewGame,
  onlineRoomCode,
  onCopyRoomCode,
  onOpenCustomImages,
}) => {
  return (
    <header className="w-full max-w-full flex items-center justify-between px-2.5 sm:px-6 py-2 sm:py-3.5 border-b border-amber-900/40 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 overflow-hidden box-border">
      
      {/* Zone 1: Single text element wordmark + Room Code if online */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
        <span className="font-cinzel text-xs sm:text-xl font-bold tracking-tight text-amber-400 whitespace-nowrap">
          <span className="inline sm:hidden">AΩ ORDER</span>
          <span className="hidden sm:inline">Alphabetical Order</span>
        </span>

        {onlineRoomCode && (
          <button
            type="button"
            onClick={onCopyRoomCode}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 text-[10px] sm:text-[11px] font-mono hover:bg-cyan-900/50 cursor-pointer shrink-0"
            title="合言葉をコピーして友達を招待"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden sm:inline">合言葉:</span>
            <span>{onlineRoomCode}</span>
          </button>
        )}
      </div>

      {/* Zone 2: 4-6 clean text navigation links (Desktop only) */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-stone-300">
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

        {onOpenCustomImages && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenCustomImages();
            }}
            className="hover:text-amber-300 text-amber-400/90 font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>自作画像設定</span>
          </button>
        )}
      </nav>

      {/* Zone 3: Actions (Responsive, compact on mobile) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile quick buttons */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenRules();
          }}
          className="md:hidden p-1.5 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
          title="ルール解説"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </button>

        {onOpenCustomImages && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenCustomImages();
            }}
            className="md:hidden p-1.5 text-amber-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="自作画像設定"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onOpenCodex();
          }}
          className="md:hidden p-1.5 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
          title="カード図鑑"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenLog();
          }}
          className="md:hidden p-1.5 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
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
          className="p-1.5 sm:p-2 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
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
          className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-serif-jp font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 shadow-sm shrink-0"
          title="新規対戦"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">新規対戦</span>
        </button>
      </div>

    </header>
  );
};
