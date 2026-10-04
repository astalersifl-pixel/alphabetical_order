import React from 'react';
import { CardData, Player } from '../types/game';
import { CardView } from './CardView';
import { Crown, Swords, Eye, Trophy, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface OpponentsBarProps {
  opponents: Player[];
  activePlayerId: string;
  isSelectOpponentPhase: boolean;
  onSelectOpponent: (opponent: Player) => void;
  viewerPlayerId: string;
  onInspectPlayer: (player: Player, tab: 'captured' | 'used') => void;
}

export const OpponentsBar: React.FC<OpponentsBarProps> = ({
  opponents,
  activePlayerId,
  isSelectOpponentPhase,
  onSelectOpponent,
  viewerPlayerId,
  onInspectPlayer,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-2 sm:gap-6 flex-wrap py-1 sm:py-2 px-1">
      {opponents.map((opponent) => {
        const isCurrentTurn = opponent.id === activePlayerId;
        const isRevealedToViewer =
          opponent.isRevealedToAll || !!opponent.revealedToPlayers[viewerPlayerId];

        return (
          <div
            key={opponent.id}
            className={`relative w-full max-w-[320px] sm:max-w-xs p-2.5 sm:p-3 rounded-2xl border transition-all box-border ${
              isCurrentTurn
                ? 'bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-950/30 ring-1 ring-amber-400/40'
                : 'bg-slate-900/80 border-slate-800 shadow-md'
            }`}
          >
            {/* Player Info Row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-stone-600 flex items-center justify-center font-bold text-xs text-amber-300">
                  {opponent.name.slice(0, 1)}
                </div>
                <div>
                  <h4 className="font-serif-jp text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-1">
                    {opponent.name}
                    {isCurrentTurn && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                  </h4>
                  <div className="text-[10px] text-stone-400 font-mono">
                    <span>手札: {opponent.hand.length}枚</span>
                  </div>
                </div>
              </div>

              {isRevealedToViewer && (
                <div className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950/70 border border-purple-500/40 px-1.5 py-0.5 rounded">
                  <Eye className="w-3 h-3" />
                  <span>手札公開中</span>
                </div>
              )}
            </div>

            {/* Public Cards Badges (Captured Points & Used Cards) */}
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-serif-jp">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onInspectPlayer(opponent, 'captured');
                }}
                className="flex-1 px-2 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 font-medium flex items-center justify-between transition-colors cursor-pointer"
                title="獲得したポイントカードを確認"
              >
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>ポイント:</span>
                </span>
                <span className="font-mono font-bold">{opponent.score}pt ({opponent.capturedCards.length}枚)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onInspectPlayer(opponent, 'used');
                }}
                className="px-2 py-1 rounded-lg bg-sky-950/40 hover:bg-sky-900/40 border border-sky-500/30 text-sky-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="勝利時に使用したカードを確認"
              >
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>使用済: {opponent.usedCards.length}枚</span>
              </button>
            </div>

            {/* Hand Cards Preview (Face Down or Revealed) */}
            <div className="flex items-center justify-center gap-1.5 min-h-[56px] py-1 bg-slate-950/50 rounded-xl p-1.5 border border-white/5">
              {opponent.hand.map((card, idx) => (
                <div key={idx} className="transition-transform hover:scale-105">
                  <CardView
                    card={isRevealedToViewer ? card : undefined}
                    faceDown={!isRevealedToViewer}
                    size="mini"
                  />
                </div>
              ))}
              {opponent.hand.length === 0 && (
                <span className="text-xs text-stone-600 italic">手札なし</span>
              )}
            </div>

            {/* Challenge Button if selecting opponent */}
            {isSelectOpponentPhase && (
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectOpponent(opponent);
                }}
                className="mt-2.5 w-full py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-serif-jp text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>この相手に対戦を挑む</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface CurrentPlayerHandProps {
  player: Player;
  isMyTurn: boolean;
  canPlayCard: boolean;
  selectedCard: CardData | null;
  onSelectCard: (card: CardData) => void;
  onConfirmPlayCard: () => void;
  turnInstruction: string;
  onInspectPlayer: (player: Player, tab: 'captured' | 'used') => void;
}

export const CurrentPlayerHand: React.FC<CurrentPlayerHandProps> = ({
  player,
  isMyTurn,
  canPlayCard,
  selectedCard,
  onSelectCard,
  onConfirmPlayCard,
  turnInstruction,
  onInspectPlayer,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 bg-slate-950/90 border border-amber-900/50 shadow-2xl backdrop-blur-md flex flex-col items-center box-border overflow-hidden">
      
      {/* Player Header & Guidance */}
      <div className="w-full flex items-center justify-between flex-wrap gap-2 mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 flex items-center justify-center shadow">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-amber-300 font-cinzel text-sm">
              {player.name.slice(0, 1)}
            </div>
          </div>
          <div>
            <h3 className="font-serif-jp text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{player.name} (あなた)</span>
              {isMyTurn && (
                <span className="text-[11px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  あなたのターン
                </span>
              )}
            </h3>
            
            {/* Clickable Public Info Chips */}
            <div className="flex items-center gap-2 text-xs font-mono mt-1">
              <span className="text-stone-400">手札: {player.hand.length}枚</span>
              <span className="text-stone-600">·</span>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onInspectPlayer(player, 'captured');
                }}
                className="px-2 py-0.5 rounded bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="自分のポイントカード一覧を確認"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>獲得: {player.score}pt ({player.capturedCards.length}枚)</span>
              </button>

              <span className="text-stone-600">·</span>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onInspectPlayer(player, 'used');
                }}
                className="px-2 py-0.5 rounded bg-sky-950/50 hover:bg-sky-900/50 border border-sky-500/30 text-sky-300 hover:text-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="勝利時に使用した自分のカード一覧を確認"
              >
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>使用済: {player.usedCards.length}枚</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action button if card is selected */}
        {canPlayCard && selectedCard && (
          <button
            onClick={() => {
              sound.playClick();
              onConfirmPlayCard();
            }}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-serif-jp text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-950/60 transition-all flex items-center gap-1.5 cursor-pointer animate-bounce"
          >
            <Swords className="w-4 h-4" />
            <span>【 {selectedCard.letter}: {selectedCard.japaneseName} 】を場に出す</span>
          </button>
        )}
      </div>

      {/* Instruction alert */}
      {turnInstruction && (
        <div className="w-full mb-2 py-1.5 px-3 bg-amber-950/30 border border-amber-500/20 rounded-lg text-xs font-serif-jp text-amber-200 text-center">
          {turnInstruction}
        </div>
      )}

      {/* Selected Card Detail Bar (Extra helpful in Full-Art mode) */}
      {selectedCard && (
        <div className="w-full mb-3 p-2.5 bg-slate-900/90 border border-amber-500/40 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-sm sm:text-base font-black text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
              {selectedCard.letter}
            </span>
            <span className="font-bold text-white font-serif-jp text-xs sm:text-sm">
              {selectedCard.japaneseName}
            </span>
            <span className="text-stone-400 font-mono text-[11px] sm:text-xs">
              <strong className="text-amber-300 font-bold">{selectedCard.points}pt</strong>
            </span>
          </div>
          <p className="text-amber-100 font-serif-jp text-xs">
            <span className="text-stone-400 mr-1">効果:</span>
            {selectedCard.shortEffect}
          </p>
        </div>
      )}

      {/* Cards in Hand */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto py-2 px-1">
        {player.hand.map((card) => {
          const isSelected = selectedCard?.letter === card.letter;
          return (
            <div
              key={card.letter}
              onClick={() => {
                if (canPlayCard) {
                  sound.playClick();
                  onSelectCard(card);
                }
              }}
              className="transition-transform duration-200"
            >
              <CardView
                card={card}
                size="md"
                selected={isSelected}
                isPlayable={canPlayCard}
              />
            </div>
          );
        })}
        {player.hand.length === 0 && (
          <div className="text-stone-500 text-xs py-8">
            手札がありません
          </div>
        )}
      </div>

    </div>
  );
};
