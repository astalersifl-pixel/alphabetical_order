import React, { useState } from 'react';
import { Crown, Swords, BookOpen, HelpCircle, Users, Bot, Play, Globe, Image as ImageIcon } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: (config: {
    playerCount: number;
    mode: 'cpu' | 'local';
    playerName: string;
  }) => void;
  onOpenRules: () => void;
  onOpenCodex: () => void;
  onOpenOnline: () => void;
  onOpenCustomImages?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenRules,
  onOpenCodex,
  onOpenOnline,
  onOpenCustomImages,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [mode, setMode] = useState<'cpu' | 'local'>('cpu');
  const [playerName, setPlayerName] = useState<string>('プレイヤー1');

  return (
    <div className="relative w-full h-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden box-border">
      
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

      {/* Main Card Container (Compact & 1-Screen Fit) */}
      <div className="relative z-10 w-full max-w-lg sm:max-w-xl bg-slate-900/90 border border-amber-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center box-border my-auto">
        
        {/* Crest & Title Row */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-amber-500/60 flex items-center justify-center bg-amber-500/10 text-amber-400">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <span className="font-cinzel tracking-widest text-[10px] sm:text-xs uppercase text-amber-400 font-bold">
            Tactical Card Battle
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-amber-500/60 flex items-center justify-center bg-amber-500/10 text-amber-400">
            <Swords className="w-3.5 h-3.5" />
          </div>
        </div>

        <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-amber-400 tracking-tight drop-shadow-md">
          Alphabetical Order
        </h1>
        <h2 className="font-serif-jp text-xs sm:text-sm font-bold text-stone-200 tracking-wider mb-1.5 sm:mb-2">
          ～勇者と魔王～
        </h2>

        <p className="font-serif-jp text-[11px] sm:text-xs text-stone-300 max-w-md mb-2 sm:mb-2.5 leading-snug hidden sm:block">
          A～Zの26枚に封じられた心理戦。勇者が魔王を狩るか、革命が秩序を覆すか。
        </p>

        {/* Online Multiplayer Banner (Compact) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenOnline();
          }}
          className="w-full p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/70 to-slate-900 border border-cyan-400/60 hover:border-cyan-300 shadow-lg text-left transition-all cursor-pointer group flex items-center justify-between mb-2 sm:mb-2.5"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-105 transition-transform">
              <Globe className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-jp text-xs sm:text-sm font-black text-cyan-300 group-hover:text-cyan-200">
                  オンライン対戦（通信対戦）
                </span>
                <span className="bg-cyan-500/20 border border-cyan-400/50 text-[9px] text-cyan-300 font-bold px-1.5 py-0.2 rounded-full">
                  リアルタイム
                </span>
              </div>
              <p className="text-[10px] text-stone-300 font-serif-jp">
                合言葉や招待リンクで離れた友達とすぐ遊べます
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold font-serif-jp shrink-0 group-hover:bg-cyan-500/30 transition-colors">
            <span>入室・作成</span>
            <span>→</span>
          </div>
        </button>

        {/* Game Setup Controls (Compact) */}
        <div className="w-full bg-slate-950/70 border border-amber-900/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 mb-2 sm:mb-3 text-left space-y-2">
          
          {/* Game Mode */}
          <div>
            <label className="text-[11px] font-serif-jp text-stone-300 block mb-1 font-medium">
              対戦方式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('cpu');
                }}
                className={`py-1.5 px-2 rounded-lg border text-xs font-serif-jp flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'cpu'
                    ? 'border-amber-400 bg-amber-950/50 text-amber-300 ring-1 ring-amber-400/50 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-stone-400 hover:border-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>VS CPU (コンピューター戦)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('local');
                }}
                className={`py-1.5 px-2 rounded-lg border text-xs font-serif-jp flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'local'
                    ? 'border-amber-400 bg-amber-950/50 text-amber-300 ring-1 ring-amber-400/50 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-stone-400 hover:border-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>パス＆プレイ (対人戦)</span>
              </button>
            </div>
          </div>

          {/* Player Count & Name in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Player Count */}
            <div>
              <label className="text-[11px] font-serif-jp text-stone-300 block mb-1 font-medium">
                参加人数
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPlayerCount(count);
                    }}
                    className={`py-1 rounded-lg border text-xs font-serif-jp transition-all cursor-pointer ${
                      playerCount === count
                        ? 'border-amber-400 bg-amber-950/50 text-amber-300 ring-1 ring-amber-400/50 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-stone-400 hover:border-slate-700'
                    }`}
                  >
                    {count}人
                  </button>
                ))}
              </div>
            </div>

            {/* Player Name */}
            <div>
              <label className="text-[11px] font-serif-jp text-stone-300 block mb-1 font-medium">
                プレイヤー名
              </label>
              <input
                type="text"
                value={playerName}
                maxLength={12}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-2.5 py-1 bg-slate-900 border border-amber-900/50 rounded-lg text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

        </div>

        {/* Start Game Action Button */}
        <div className="w-full flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onStartGame({
                playerCount,
                mode,
                playerName: playerName.trim() || 'プレイヤー1',
              });
            }}
            className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-serif-jp text-sm sm:text-base rounded-xl shadow-lg shadow-amber-950/60 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>対戦を開始する</span>
          </button>
        </div>

        {/* Secondary Links Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-2 sm:mt-2.5 text-[11px] sm:text-xs text-stone-400 font-serif-jp">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400/80" />
            <span>遊び方・ルール</span>
          </button>

          <span className="text-stone-700">·</span>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400/80" />
            <span>全26枚 カード図鑑</span>
          </button>

          {onOpenCustomImages && (
            <>
              <span className="text-stone-700">·</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCustomImages();
                }}
                className="hover:text-amber-300 text-amber-400/90 font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>イラスト設定</span>
              </button>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
