import React, { useState } from 'react';
import { Crown, Swords, BookOpen, HelpCircle, Users, Bot, Sparkles, Play } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: (config: {
    playerCount: number;
    mode: 'cpu' | 'local';
    playerName: string;
  }) => void;
  onOpenRules: () => void;
  onOpenCodex: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenRules,
  onOpenCodex,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [mode, setMode] = useState<'cpu' | 'local'>('cpu');
  const [playerName, setPlayerName] = useState<string>('プレイヤー1');

  return (
    <div className="relative w-full min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      
      {/* Background visual artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/card_table_backdrop_1791047498010.jpg"
          alt="Card Table Backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.32] contrast-125 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
        
        {/* Crest & Title */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full border border-amber-500/60 flex items-center justify-center bg-amber-500/10 text-amber-400">
            <Crown className="w-5 h-5" />
          </div>
          <span className="font-cinzel tracking-widest text-xs uppercase text-amber-400 font-bold">
            Tactical Card Battle
          </span>
          <div className="w-10 h-10 rounded-full border border-amber-500/60 flex items-center justify-center bg-amber-500/10 text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
        </div>

        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-amber-400 tracking-tight drop-shadow-md mb-2">
          Alphabetical Order
        </h1>
        <h2 className="font-serif-jp text-lg sm:text-2xl font-bold text-stone-200 tracking-wider mb-6">
          ～勇者と魔王～
        </h2>

        <p className="font-serif-jp text-xs sm:text-sm text-stone-300 max-w-lg mb-8 leading-relaxed">
          A～Zの26枚に封じられた神・英傑・魔獣たちの心理戦。
          勇者が魔王を狩るか、革命が秩序を覆すか、狡猾な策略が勝者を決める。
        </p>

        {/* Game Setup Controls */}
        <div className="w-full bg-slate-950/70 border border-amber-900/40 rounded-2xl p-5 mb-8 text-left space-y-5">
          
          {/* Game Mode */}
          <div>
            <label className="text-xs font-serif-jp text-stone-300 block mb-2 font-medium">
              対戦方式
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('cpu');
                }}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-serif-jp flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'cpu'
                    ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400/50 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-stone-400 hover:border-slate-700'
                }`}
              >
                <Bot className="w-4 h-4 text-amber-400" />
                <span>VS CPU (コンピューター戦)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('local');
                }}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-serif-jp flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'local'
                    ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400/50 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-stone-400 hover:border-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span>パス＆プレイ (対人戦)</span>
              </button>
            </div>
          </div>

          {/* Player Count */}
          <div>
            <label className="text-xs font-serif-jp text-stone-300 block mb-2 font-medium">
              参加人数
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setPlayerCount(count);
                  }}
                  className={`p-2.5 rounded-xl border text-xs sm:text-sm font-serif-jp transition-all cursor-pointer ${
                    playerCount === count
                      ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400/50 font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-stone-400 hover:border-slate-700'
                  }`}
                >
                  {count}人 対戦 {count === 2 ? '(1 vs 1)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Player Name */}
          <div>
            <label className="text-xs font-serif-jp text-stone-300 block mb-2 font-medium">
              あなたのプレイヤー名
            </label>
            <input
              type="text"
              value={playerName}
              maxLength={12}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-amber-900/50 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

        </div>

        {/* Start Game Action */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onStartGame({
                playerCount,
                mode,
                playerName: playerName.trim() || 'プレイヤー1',
              });
            }}
            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-serif-jp text-base rounded-xl shadow-xl shadow-amber-950/60 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>対戦を開始する</span>
          </button>
        </div>

        {/* Secondary Links */}
        <div className="flex items-center gap-6 mt-6 text-xs text-stone-400 font-serif-jp">
          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400/80" />
            <span>遊び方・公式ルール</span>
          </button>

          <span className="text-stone-700">·</span>

          <button
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400/80" />
            <span>全26枚 カード図鑑</span>
          </button>
        </div>

      </div>

    </div>
  );
};
