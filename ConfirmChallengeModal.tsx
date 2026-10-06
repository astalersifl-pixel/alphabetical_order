import React from 'react';
import { Player, CardData } from '../types/game';
import { Swords, X, Shield, Trophy, UserCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface ConfirmChallengeModalProps {
  target: Player;
  challengerCard?: CardData | null;
  seatNumber?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmChallengeModal: React.FC<ConfirmChallengeModalProps> = ({
  target,
  challengerCard,
  seatNumber,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-stone-100 flex flex-col items-center">
        {/* Close cross */}
        <button
          onClick={() => {
            sound.playClick();
            onCancel();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          title="キャンセル"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/60 mb-3 ring-4 ring-rose-500/20">
          <Swords className="w-6 h-6 text-white" />
        </div>

        <h3 className="font-serif-jp text-lg sm:text-xl font-black text-amber-300 tracking-wide text-center">
          対戦相手の確認
        </h3>
        <p className="text-stone-300 text-xs sm:text-sm font-serif-jp text-center mt-1">
          以下のプレイヤーにバトルを挑みますか？
        </p>

        {/* Opponent Profile Card */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/80 border border-amber-900/40 shadow-inner flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center font-bold text-base text-amber-300 shadow">
              {target.name.slice(0, 1)}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h4 className="font-serif-jp font-bold text-base text-white">
                  {target.name}
                </h4>
                {seatNumber !== undefined && (
                  <span className="text-[10px] text-amber-300/90 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                    {seatNumber}番手
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-400 font-serif-jp">
                {target.type === 'human' ? 'プレイヤー' : 'CPU対戦相手'}
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-white/10 text-xs font-serif-jp">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 block">手札枚数</span>
                <span className="font-mono font-bold text-white text-sm">{target.hand.length}枚</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 block">現在のポイント</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{target.score}pt</span>
              </div>
            </div>
          </div>
        </div>

        {challengerCard && (
          <div className="mt-3 text-xs text-stone-400 font-serif-jp flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>あなたのカードは裏向きでセットされています</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-700 bg-slate-800/80 hover:bg-slate-700/80 text-stone-300 hover:text-white font-serif-jp text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            キャンセル
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onConfirm();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-serif-jp text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Swords className="w-4 h-4" />
            <span>対戦を挑む！</span>
          </button>
        </div>
      </div>
    </div>
  );
};
