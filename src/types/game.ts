export type Letter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export type CardCategory = 'deity' | 'hero' | 'dragon' | 'demon' | 'myth' | 'beast' | 'human' | 'spirit';

export interface CardData {
  letter: Letter;
  name: string;
  japaneseName: string;
  points: number;
  description: string;
  shortEffect: string;
  category: CardCategory;
  lore: string;
  flavorQuote?: string;
}

export type PlayerType = 'human' | 'cpu';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  avatarSeed: number;
  avatarImage?: string;
  hand: CardData[];
  capturedCards: CardData[];
  score: number;
  firePhoenixUsed: boolean;
  isRevealedToAll: boolean;
  revealedToPlayers: Record<string, boolean>; // playerId -> true if they can see this player's hand
}

export type GamePhase =
  | 'TITLE'
  | 'DEALING'
  | 'PLAYER_TURN_DRAW'
  | 'SELECT_PLAY_CARD'
  | 'SELECT_OPPONENT'
  | 'OPPONENT_SELECT_CARD'
  | 'BATTLE_REVEAL'
  | 'RESOLVING_EFFECTS'
  | 'EFFECT_INTERACTION' // e.g. Werewolf choosing from deck, Vampire choosing from hand
  | 'BATTLE_CLEANUP'
  | 'GAME_OVER';

export interface BattleRecord {
  turnNumber: number;
  challengerId: string;
  challengerCard: CardData;
  defenderId: string;
  defenderCard: CardData;
  winnerId: string | null; // null if draw/tie (not typical with unique deck, but safe)
  loserId: string | null;
  instantWinWinnerId?: string | null;
  effectsTriggered: string[];
  revolutionChanged: boolean;
  isRevolutionActiveAtBattle: boolean;
}

export interface EffectInteractionState {
  type: 'WEREWOLF_SEARCH_DECK' | 'VAMPIRE_STEAL' | 'XENOS_STEAL' | 'QUEEN_SELECT_PLAYER';
  actorPlayerId: string;
  targetPlayerId?: string;
  availableCards?: CardData[];
  candidatePlayers?: Player[];
  description: string;
}

export interface GameLogEntry {
  id: string;
  turn: number;
  text: string;
  type: 'turn' | 'battle' | 'effect' | 'win' | 'special';
  timestamp: number;
}
