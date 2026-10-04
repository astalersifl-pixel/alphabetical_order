import React from 'react';
import { X, Crown, Flame, Swords, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { sound } from '../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCodex: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  onOpenCodex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-900/60 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col text-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/40 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xl sm:text-2xl font-bold text-amber-400">
              Game Rules
            </span>
            <span className="text-xs text-stone-400 font-serif-jp">
              ～勇者と魔王～ 公式ルール
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

        {/* Rules Content */}
        <div className="space-y-6 text-xs sm:text-sm font-serif-jp leading-relaxed">
          
          {/* Section 1: Overview */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/30">
            <h4 className="font-bold text-amber-300 text-sm sm:text-base mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              ゲームの概要と準備
            </h4>
            <p className="text-stone-300 mb-2">
              A～Zのアルファベットが記された全26枚のカードを使用します。
              各カードには固有の「ポイント」と「特殊効果」が存在します。
            </p>
            <ul className="list-disc list-inside text-stone-400 space-y-1">
              <li>カードをシャッフルし、各プレイヤーに初期手札として3枚ずつ配布します。</li>
              <li>残りのカードは山札（ドローデック）としてテーブル中央に配置します。</li>
            </ul>
          </div>

          {/* Section 2: Turn Flow */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/30">
            <h4 className="font-bold text-amber-300 text-sm sm:text-base mb-2 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              ターンの進行と戦闘
            </h4>
            <ol className="list-decimal list-inside text-stone-300 space-y-2">
              <li>
                <strong className="text-amber-200">ドロー：</strong> 自分のターン開始時、山札からカードを1枚引きます。
              </li>
              <li>
                <strong className="text-amber-200">セット：</strong> 手札から1枚を選び、裏向きで場に出します。
              </li>
              <li>
                <strong className="text-amber-200">対戦相手の指名：</strong> 対戦するプレイヤーを1人選びます。選ばれたプレイヤーも手札から1枚裏向きで場に出します。
              </li>
              <li>
                <strong className="text-amber-200">オープン＆判定：</strong> 同時にカードをオープン！
                通常はアルファベットの順（Aが一番強く、Zが一番弱い）で勝敗が決まります。
              </li>
              <li>
                <strong className="text-amber-200">効果発動＆カード所持：</strong>
                戦闘終了後、カードに記載された効果が発動します。
                勝者は自分のカードを「使用済み」として所持し、相手のカードを「ポイントカード」として獲得・所持します。
                ※これらのカードはいつでも誰でも自由に確認できます。
              </li>
              <li>
                <strong className="text-amber-200">手番終了＆次のターン：</strong>
                手番が終了し、次は【バトルに敗北したプレイヤー】の番となります！
              </li>
            </ol>
          </div>

          {/* Section 3: Special Wins & Revolution */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
            <h4 className="font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              劇的な逆転＆特殊勝利条件
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/20">
                <span className="font-bold text-sky-300 block mb-1">
                  B: Brave（勇者）の討伐勝利
                </span>
                <p className="text-stone-300 text-xs">
                  魔王（D: Devil）にバトルで勝った場合、ポイントに関係なくゲームが即座に終了し、勇者の完全勝利となります！
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/20">
                <span className="font-bold text-amber-300 block mb-1">
                  Y: Youth（青年）の奇跡勝利
                </span>
                <p className="text-stone-300 text-xs">
                  ゼロ（Z: Zero）に勝った場合、ポイントに関係なくゲームが即座に終了し、青年の完全勝利となります！
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-rose-500/30">
                <span className="font-bold text-rose-300 block mb-1">
                  R: Revolutionary（革命家）の革命
                </span>
                <p className="text-stone-300 text-xs">
                  バトルに勝利すると世界の秩序が逆転！
                  以降はZが最強、Aが最弱へとひっくり返ります。
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-purple-500/30">
                <span className="font-bold text-purple-300 block mb-1">
                  D: Devil（魔王）の終焉
                </span>
                <p className="text-stone-300 text-xs">
                  バトル終了後、強制的にゲームを終了させます。（相手の効果は発動します）
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: End Game & Scoring */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/30">
            <h4 className="font-bold text-amber-300 text-sm sm:text-base mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              ゲームの終了と勝敗判定
            </h4>
            <p className="text-stone-300 mb-2">
              以下のいずれかでゲームが終了します：
            </p>
            <ul className="list-disc list-inside text-stone-400 space-y-1 mb-3">
              <li>特殊勝利（勇者が魔王を討伐、または青年がゼロを撃破）が発生した時</li>
              <li>魔王（D）の戦闘が終了した時</li>
              <li>山札が尽きてカードをドローできなくなった時</li>
            </ul>

            <div className="p-3 rounded-lg bg-slate-900 border border-amber-900/40 text-xs space-y-1">
              <span className="font-bold text-amber-300">★ 最終得点計算：</span>
              <p className="text-stone-300">
                獲得した相手カードの合計ポイント ＋ 手札ボーナス
              </p>
              <p className="text-amber-200">
                ・太陽神（A）：手札にあれば +10ポイント！<br />
                ・クリスタルドラゴン（C）：手札にあれば +5ポイント！
              </p>
              <p className="text-stone-400 pt-1">
                最も合計ポイントの多いプレイヤーが優勝となります。
              </p>
            </div>
          </div>

        </div>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-amber-900/40 flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>全26枚のカード効果一覧（図鑑）を見る</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
};
