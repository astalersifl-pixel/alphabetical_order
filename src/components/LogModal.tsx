import React from 'react';
import { GameLogEntry } from '../types/game';
import { X, History, Sparkles, Swords, Crown, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GameLogEntry[];
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-900/60 rounded-2xl shadow-2xl p-6 flex flex-col text-slate-200 max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span className="font-cinzel text-xl font-bold text-amber-400">
              Battle History
            </span>
            <span className="text-xs text-stone-400 font-serif-jp">
              戦闘ログ
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

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-serif-jp text-xs sm:text-sm">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              まだ戦闘記録がありません
            </div>
          ) : (
            logs.map((log) => {
              const getLogIcon = () => {
                switch (log.type) {
                  case 'battle':
                    return <Swords className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />;
                  case 'effect':
                    return <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
                  case 'win':
                    return <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
                  case 'special':
                    return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
                  default:
                    return <div className="w-2 h-2 rounded-full bg-stone-500 shrink-0 mt-1.5" />;
                }
              };

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                    log.type === 'win'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : log.type === 'special'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-slate-950/50 border-slate-800 text-stone-300'
                  }`}
                >
                  {getLogIcon()}
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5">
                      <span>Turn {log.turn}</span>
                    </div>
                    <p className="leading-relaxed">{log.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-amber-900/30 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-stone-300 rounded-lg text-xs transition-colors"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
};
