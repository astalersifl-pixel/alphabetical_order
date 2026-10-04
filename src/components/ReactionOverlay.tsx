import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { ReactionStamp } from '../utils/onlineGame';
import { sound } from '../utils/audio';

const STAMPS = [
  { emoji: '⚔️', label: '勝負！' },
  { emoji: '🛡️', label: '受けて立つ！' },
  { emoji: '😱', label: 'まさか…！' },
  { emoji: '👑', label: '王手！' },
  { emoji: '👏', label: 'お見事！' },
  { emoji: '🔄', label: '革命だ！' },
];

interface ReactionOverlayProps {
  reactions: ReactionStamp[];
  onSendReaction: (text: string) => void;
  myPlayerId: string;
}

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({
  reactions,
  onSendReaction,
  myPlayerId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Show only reactions from the last 6 seconds
  const now = Date.now();
  const recentReactions = reactions.filter((r) => now - r.timestamp < 6000);

  return (
    <>
      {/* Floating active reactions container */}
      <div className="fixed bottom-24 right-4 sm:right-8 z-30 flex flex-col gap-2 pointer-events-none items-end">
        {recentReactions.map((r) => {
          const isMine = r.playerId === myPlayerId;
          return (
            <div
              key={r.id}
              className={`animate-bounce px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md border text-xs sm:text-sm font-serif-jp flex items-center gap-2 ${
                isMine
                  ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                  : 'bg-slate-900/90 border-sky-400 text-sky-200'
              }`}
            >
              <span className="font-bold text-[11px] opacity-75">{r.playerName}:</span>
              <span className="font-black">{r.text}</span>
            </div>
          );
        })}
      </div>

      {/* Stamp selection bar / trigger */}
      <div className="fixed bottom-4 right-4 sm:right-8 z-40 flex items-center gap-2">
        {isOpen && (
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
            {STAMPS.map((stamp) => (
              <button
                key={stamp.label}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSendReaction(`${stamp.emoji} ${stamp.label}`);
                  setIsOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-xl hover:bg-amber-500/20 text-xs font-serif-jp text-stone-200 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>{stamp.emoji}</span>
                <span className="hidden sm:inline text-[11px]">{stamp.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setIsOpen(!isOpen);
          }}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-950/60 transition-transform active:scale-95 cursor-pointer"
          title="スタンプ送信"
        >
          <Smile className="w-5 h-5 fill-slate-950" />
        </button>
      </div>
    </>
  );
};
