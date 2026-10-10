import React from 'react';
import { CardData } from '../types/game';
import { CardView } from './CardView';
import { Eye, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export interface HandInspectionData {
  cardLetter: 'O' | 'P' | 'Q' | 'T';
  cardName: string;
  title: string;
  description: string;
  targets: {
    playerId: string;
    playerName: string;
    cards: CardData[];
  }[];
}

interface HandInspectionModalProps {
  inspection: HandInspectionData | null;
  onClose: () => void;
  onInspectCard?: (card: CardData) => void;
}

export const HandInspectionModal: React.FC<HandInspectionModalProps> = ({
  inspection,
  onClose,
  onInspectCard,
}) => {
  if (!inspection) return null;

  const handleConfirm = () => {
    sound.playCardFlip();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-stone-950 to-slate-950 border-2 border-amber-500/60 rounded-2xl shadow-2xl p-4 sm:p-5 text-stone-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center font-cinzel font-black text-amber-300 text-lg">
              {inspection.cardLetter}
            </div>
            <div>
              <h3 className="font-serif-jp text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
                <span>{inspection.title}</span>
                <span className="text-xs text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {inspection.cardName}
                </span>
              </h3>
              <p className="text-xs text-stone-300 font-serif-jp mt-0.5">
                {inspection.description}
              </p>
            </div>
          </div>
        </div>

        {/* Target Hand(s) Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1">
          {inspection.targets.map((target) => (
            <div
              key={target.playerId}
              className="p-3 rounded-xl bg-slate-950/80 border border-amber-900/40 shadow-inner"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif-jp text-sm font-bold text-amber-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{target.playerName} の手札</span>
                  <span className="text-xs font-mono text-stone-400">
                    ({target.cards.length}枚)
                  </span>
                </span>
                <span className="text-[11px] text-amber-400/70 font-serif-jp">
                  ※確認後、非公開に戻ります
                </span>
              </div>

              {target.cards.length > 0 ? (
                <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                  {target.cards.map((card, idx) => (
                    <div
                      key={`${card.letter}-${idx}`}
                      className="flex flex-col items-center shrink-0 group relative"
                    >
                      <CardView card={card} size="sm" isPlayable={false} />
                      <div className="mt-1 text-center">
                        <span className="font-cinzel text-xs font-bold text-amber-300 block">
                          {card.letter}: {card.japaneseName}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono block">
                          {card.points}pt
                        </span>
                      </div>
                      {onInspectCard && (
                        <button
                          type="button"
                          onClick={() => onInspectCard(card)}
                          className="mt-1 px-1.5 py-0.2 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 text-[9px] font-serif-jp transition-colors cursor-pointer"
                        >
                          詳細
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-stone-500 text-xs py-2 text-center font-serif-jp">
                  手札がありません（0枚）
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer / Confirmation Button */}
        <div className="pt-3 mt-3 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-stone-400 font-serif-jp flex items-center gap-1.5 text-center sm:text-left">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>「確認完了」を押すと、手札は直ちに相手に伏せられ元の非公開状態に戻ります。</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-serif-jp text-sm rounded-xl shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 fill-slate-950 text-white" />
            <span>確認しました（手札を非公開に戻す）</span>
          </button>
        </div>

      </div>
    </div>
  );
};
