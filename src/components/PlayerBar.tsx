import React from 'react';
import { CardData, Player } from '../types/game';
import { CardView } from './CardView';
import { Crown, Swords, Eye, Trophy, ShieldCheck, HelpCircle, BookOpen, Search } from 'lucide-react';
import { sound } from '../utils/audio';

interface OpponentsBarProps {
  opponents: Player[];
  allPlayers?: Player[];
  activePlayerId: string;
  isSelectOpponentPhase: boolean;
  onSelectOpponent: (opponent: Player) => void;
  viewerPlayerId: string;
  onInspectPlayer: (player: Player, tab: 'captured' | 'used') => void;
  onInspectCard?: (card: CardData) => void;
}

export const OpponentsBar: React.FC<OpponentsBarProps> = ({
  opponents,
  allPlayers,
  activePlayerId,
  isSelectOpponentPhase,
  onSelectOpponent,
  viewerPlayerId,
  onInspectPlayer,
  onInspectCard,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap py-0.5 px-1 shrink-0">
      {opponents.map((opponent) => {
        const isCurrentTurn = opponent.id === activePlayerId;
        const isRevealedToViewer =
          opponent.isRevealedToAll || !!opponent.revealedToPlayers[viewerPlayerId];
        const seatIndex = allPlayers ? allPlayers.findIndex((p) => p.id === opponent.id) : -1;
        const hasNoHand = opponent.hand.length === 0;

        return (
          <div
            key={opponent.id}
            className={`relative flex-1 min-w-[220px] max-w-[320px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all box-border ${
              isCurrentTurn
                ? 'bg-amber-950/40 border-amber-500/70 shadow-md shadow-amber-950/30 ring-1 ring-amber-400/40'
                : 'bg-slate-900/80 border-slate-800 shadow-sm'
            } ${isSelectOpponentPhase && hasNoHand ? 'opacity-60 grayscale-[30%]' : ''}`}
          >
            {/* Player Info Row */}
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 border border-stone-600 flex items-center justify-center font-bold text-[11px] text-amber-300 shrink-0">
                  {opponent.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif-jp text-xs font-bold text-stone-100 flex items-center gap-1 truncate">
                    <span className="truncate">{opponent.name}</span>
                    {seatIndex !== -1 && (
                      <span className="text-[9px] text-amber-300/80 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/20 font-mono shrink-0">
                        {seatIndex + 1}番手
                      </span>
                    )}
                    {isCurrentTurn && <Crown className="w-3 h-3 text-amber-400 shrink-0 animate-bounce" />}
                  </h4>
                </div>
              </div>

              {/* Hand count badge */}
              <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/60 border border-stone-800 shrink-0 ${hasNoHand ? 'text-rose-400 font-bold' : 'text-stone-300'}`}>
                手札: {opponent.hand.length}枚
              </div>
            </div>

            {/* Public Info Row & Hand preview */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-serif-jp">
              {/* Score pill */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onInspectPlayer(opponent, 'captured');
                }}
                className="px-1.5 py-0.5 rounded bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer truncate"
                title="獲得ポイントカードを確認"
              >
                <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-mono font-bold">{opponent.score}pt</span>
              </button>

              {/* Used cards pill */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onInspectPlayer(opponent, 'used');
                }}
                className="px-1.5 py-0.5 rounded bg-sky-950/40 hover:bg-sky-900/40 border border-sky-500/30 text-sky-300 font-medium flex items-center gap-1 transition-colors cursor-pointer truncate"
                title="使用済みカードを確認"
              >
                <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
                <span>済:{opponent.usedCards.length}</span>
              </button>

              {/* Revealed cards preview or challenge button */}
              {isRevealedToViewer && (
                <div className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3 text-purple-300 shrink-0" />
                  {opponent.hand.slice(0, 3).map((card, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onInspectCard?.(card)}
                      className="px-1 py-0.2 rounded bg-purple-900/60 border border-purple-400/40 text-[9px] font-cinzel font-bold text-purple-200 hover:bg-purple-700 hover:scale-105 transition-all cursor-pointer"
                      title="クリックして別枠で詳細を見る"
                    >
                      {card.letter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Challenge Button if selecting opponent */}
            {isSelectOpponentPhase && (
              !hasNoHand ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectOpponent(opponent);
                  }}
                  className="mt-1 w-full py-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-serif-jp text-[11px] font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                >
                  <Swords className="w-3 h-3" />
                  <span>この相手に対戦を挑む</span>
                </button>
              ) : (
                <div className="mt-1 w-full py-0.5 bg-slate-900/90 border border-stone-800 text-stone-500 font-serif-jp text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-not-allowed select-none">
                  <span>手札なし（対戦不可）</span>
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

interface CurrentPlayerHandProps {
  player: Player;
  seatNumber?: number;
  isMyTurn: boolean;
  canPlayCard: boolean;
  selectedCard: CardData | null;
  onSelectCard: (card: CardData) => void;
  onConfirmPlayCard: () => void;
  turnInstruction: string;
  onInspectPlayer: (player: Player, tab: 'captured' | 'used') => void;
  onOpenRules?: () => void;
  onOpenCodex?: () => void;
  onInspectCard?: (card: CardData) => void;
}

export const CurrentPlayerHand: React.FC<CurrentPlayerHandProps> = ({
  player,
  seatNumber,
  isMyTurn,
  canPlayCard,
  selectedCard,
  onSelectCard,
  onConfirmPlayCard,
  turnInstruction,
  onInspectPlayer,
  onOpenRules,
  onOpenCodex,
  onInspectCard,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 bg-slate-950/95 border border-amber-900/50 shadow-2xl backdrop-blur-md flex flex-col items-center box-border shrink-0">
      
      {/* Player Header & Guidance Row */}
      <div className="w-full flex items-center justify-between gap-1.5 mb-1 pb-1 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 flex items-center justify-center shadow shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-amber-300 font-cinzel text-xs">
              {player.name.slice(0, 1)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <h3 className="font-serif-jp font-bold text-white text-xs sm:text-sm flex items-center gap-1 truncate">
              <span>{player.name} (あなた)</span>
              {seatNumber !== undefined && (
                <span className="text-[9px] text-amber-300/80 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/20 font-mono">
                  {seatNumber}番手
                </span>
              )}
            </h3>
            {isMyTurn && (
              <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse shrink-0">
                あなたの手番
              </span>
            )}
          </div>
        </div>

        {/* Action Tools & Public Badges */}
        <div className="flex items-center gap-1 sm:gap-2 text-[11px] font-mono shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onInspectPlayer(player, 'captured');
            }}
            className="px-1.5 sm:px-2 py-0.5 rounded bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="自分の獲得ポイントカード一覧を確認"
          >
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>獲得: {player.score}pt ({player.capturedCards.length}枚)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onInspectPlayer(player, 'used');
            }}
            className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/50 hover:bg-sky-900/50 border border-sky-500/30 text-sky-300 transition-colors cursor-pointer"
            title="勝利時に使用した自分のカード一覧を確認"
          >
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            <span>使用済: {player.usedCards.length}枚</span>
          </button>

          {onOpenCodex && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenCodex();
              }}
              className="px-1.5 sm:px-2 py-0.5 rounded bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 font-serif-jp transition-colors flex items-center gap-1 cursor-pointer"
              title="カード全26枚の詳細・効果図鑑を開く"
            >
              <BookOpen className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">カード一覧</span>
            </button>
          )}

          {onOpenRules && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-stone-700 text-stone-300 hover:text-white font-serif-jp transition-colors flex items-center gap-1 cursor-pointer"
              title="ルール確認"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">ルール</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Card Bar & Action Strip */}
      {selectedCard ? (
        <div className="w-full mb-1 p-1 sm:p-1.5 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-xl flex items-center justify-between gap-1.5 text-xs shadow-md animate-fade-in">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-cinzel text-xs sm:text-sm font-black text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 shrink-0">
              {selectedCard.letter}
            </span>
            <span className="font-bold text-white font-serif-jp text-xs truncate">
              {selectedCard.japaneseName}
            </span>
            <span className="text-amber-300 font-mono font-bold text-[11px] shrink-0">
              {selectedCard.points}pt
            </span>
            <span className="text-stone-300 font-serif-jp text-[11px] hidden md:inline truncate">
              {selectedCard.shortEffect}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Full Card in Separate Modal Frame */}
            {onInspectCard && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onInspectCard(selectedCard);
                }}
                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105"
                title="カードの絵柄や効果全文を別枠で拡大表示"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>別枠で詳細</span>
              </button>
            )}

            {/* Confirm Play Button */}
            {canPlayCard && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onConfirmPlayCard();
                }}
                className="px-3 sm:px-4 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-serif-jp text-xs rounded-lg shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>場に出す</span>
              </button>
            )}
          </div>
        </div>
      ) : turnInstruction ? (
        <div className="w-full mb-1 py-0.5 px-2 bg-amber-950/30 border border-amber-500/20 rounded-lg text-[11px] sm:text-xs font-serif-jp text-amber-200 text-center truncate">
          {turnInstruction}
        </div>
      ) : null}

      {/* Cards in Hand - Compact Size to Fit on 1 Screen */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 px-1">
        {player.hand.map((card) => {
          const isSelected = selectedCard?.letter === card.letter;
          return (
            <div
              key={card.letter}
              className="relative group transition-transform duration-200 hover:-translate-y-1"
            >
              <div
                onClick={() => {
                  if (canPlayCard) {
                    sound.playClick();
                    onSelectCard(card);
                  } else if (onInspectCard) {
                    sound.playClick();
                    onInspectCard(card);
                  }
                }}
                className="cursor-pointer"
              >
                <CardView
                  card={card}
                  size="sm"
                  selected={isSelected}
                  isPlayable={canPlayCard}
                />
              </div>

              {/* Quick Zoom Button on Each Card */}
              {onInspectCard && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onInspectCard(card);
                  }}
                  className="absolute -top-1 -right-1 z-30 w-5 h-5 rounded-full bg-slate-900/90 border border-amber-400/80 text-amber-300 flex items-center justify-center text-[10px] shadow-lg hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer opacity-80 group-hover:opacity-100 hover:scale-110"
                  title="別枠で拡大・効果確認"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {player.hand.length === 0 && (
          <div className="text-stone-500 text-xs py-3 font-serif-jp">
            手札がありません
          </div>
        )}
      </div>

    </div>
  );
};
