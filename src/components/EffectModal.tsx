import React, { useState } from 'react';
import { CardData, EffectInteractionState, Player } from '../types/game';
import { CardView } from './CardView';
import { sound } from '../utils/audio';
import { Eye, Hand, Sparkles, Check, Hourglass, ShieldAlert } from 'lucide-react';

interface EffectModalProps {
  interaction: EffectInteractionState | null;
  viewerPlayerId?: string;
  actorPlayerName?: string;
  onSelectCard?: (card: CardData) => void;
  onSelectPlayer?: (player: Player) => void;
  onClose?: () => void;
}

export const EffectModal: React.FC<EffectModalProps> = ({
  interaction,
  viewerPlayerId,
  actorPlayerName,
  onSelectCard,
  onSelectPlayer,
  onClose,
}) => {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  if (!interaction) return null;

  // Determine if the current viewer is the one who should take the action
  const isActor =
    !viewerPlayerId ||
    !interaction.actorPlayerId ||
    interaction.actorPlayerId === viewerPlayerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-900/40">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            {isActor ? <Sparkles className="w-6 h-6" /> : <Hourglass className="w-6 h-6 animate-pulse" />}
          </div>
          <div>
            <h3 className="font-serif-jp text-base sm:text-xl font-bold text-amber-300">
              {isActor ? 'カード効果発動（あなたの選択）' : '相手プレイヤーが効果を選択中'}
            </h3>
            <p className="text-xs text-stone-300">
              {interaction.description}
            </p>
          </div>
        </div>

        {/* If the viewer is NOT the actor: show waiting view only! */}
        {!isActor ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-4 bg-slate-950/60 rounded-xl border border-amber-900/30">
            <div className="w-14 h-14 rounded-full border-3 border-amber-500/30 border-t-amber-400 animate-spin flex items-center justify-center">
              <Hourglass className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="font-serif-jp text-base font-bold text-amber-300 mb-1">
                {actorPlayerName ? `${actorPlayerName} がカードを選択中です` : '相手プレイヤーが選択中です'}
              </h4>
              <p className="text-xs text-stone-400 max-w-md">
                カード効果の処理が行われています。相手の決定をお待ちください...
              </p>
            </div>
          </div>
        ) : (
          /* Interactive view for the actor only! */
          <>
            {/* Werewolf Search Deck */}
            {interaction.type === 'WEREWOLF_SEARCH_DECK' && interaction.availableCards && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-amber-200/90 font-serif-jp">
                  山札の全カードです。手札に加えたいカードを1枚選択してください：
                </p>

                <div className="max-h-[50vh] overflow-y-auto p-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 bg-slate-950/60 rounded-xl border border-amber-900/30">
                  {interaction.availableCards.map((card) => {
                    const isSelected = selectedCard?.letter === card.letter;
                    return (
                      <div
                        key={card.letter}
                        onClick={() => {
                          sound.playClick();
                          setSelectedCard(card);
                        }}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <CardView
                          card={card}
                          size="sm"
                          selected={isSelected}
                          isPlayable={true}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    disabled={!selectedCard}
                    onClick={() => {
                      if (selectedCard && onSelectCard) {
                        sound.playClick();
                        onSelectCard(selectedCard);
                      }
                    }}
                    className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    このカードを手札に加える
                  </button>
                </div>
              </div>
            )}

            {/* Vampire Steal & Xenos Steal */}
            {(interaction.type === 'VAMPIRE_STEAL' || interaction.type === 'XENOS_STEAL') && interaction.availableCards && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-rose-300 font-serif-jp">
                  相手の手札から強奪するカードを1枚選んでください：
                </p>

                <div className="max-h-[50vh] overflow-y-auto p-4 flex flex-wrap justify-center gap-4 bg-slate-950/60 rounded-xl border border-rose-900/40">
                  {interaction.availableCards.map((card, idx) => {
                    const isSelected = selectedCard?.letter === card.letter;
                    return (
                      <div
                        key={`${card.letter}-${idx}`}
                        onClick={() => {
                          sound.playClick();
                          setSelectedCard(card);
                        }}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <CardView
                          card={card}
                          size="md"
                          selected={isSelected}
                          isPlayable={true}
                        />
                      </div>
                    );
                  })}
                  {interaction.availableCards.length === 0 && (
                    <div className="text-stone-500 text-sm py-8">
                      奪えるカードがありません
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    disabled={!selectedCard}
                    onClick={() => {
                      if (selectedCard && onSelectCard) {
                        sound.playClick();
                        onSelectCard(selectedCard);
                      }
                    }}
                    className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Hand className="w-4 h-4" />
                    このカードを奪う
                  </button>
                </div>
              </div>
            )}

            {/* Queen Select Player */}
            {interaction.type === 'QUEEN_SELECT_PLAYER' && interaction.candidatePlayers && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-purple-300 font-serif-jp">
                  手札を全員に公開させたいプレイヤーを指名してください：
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-purple-900/40">
                  {interaction.candidatePlayers.map((player) => {
                    const isSelected = selectedPlayer?.id === player.id;
                    return (
                      <div
                        key={player.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedPlayer(player);
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-purple-400 bg-purple-950/40 ring-2 ring-purple-400/40'
                            : 'border-slate-800 bg-slate-900 hover:border-purple-800'
                        }`}
                      >
                        <div>
                          <h4 className="font-serif-jp text-sm font-bold text-stone-100">
                            {player.name}
                          </h4>
                          <span className="text-xs text-stone-400 font-mono">
                            手札: {player.hand.length}枚 · 得点: {player.score}pt
                          </span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    disabled={!selectedPlayer}
                    onClick={() => {
                      if (selectedPlayer && onSelectPlayer) {
                        sound.playClick();
                        onSelectPlayer(selectedPlayer);
                      }
                    }}
                    className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    このプレイヤーの手札を全員に公開する
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
