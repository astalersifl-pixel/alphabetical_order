import { CardData, Player } from '../types/game';
import { compareCards } from '../data/cards';

export interface AIDecisionContext {
  cpuPlayer: Player;
  allPlayers: Player[];
  targetOpponent?: Player;
  isRevolution: boolean;
  deckCount: number;
}

export const selectCpuCardToPlay = (ctx: AIDecisionContext): CardData => {
  const { cpuPlayer, targetOpponent, isRevolution, allPlayers } = ctx;
  const hand = cpuPlayer.hand;

  if (hand.length === 1) {
    return hand[0];
  }

  // Calculate current point lead
  const highestOpponentScore = Math.max(
    ...allPlayers.filter((p) => p.id !== cpuPlayer.id).map((p) => p.score),
    0
  );
  const isWinning = cpuPlayer.score > highestOpponentScore;

  // 1. If CPU has Devil ('D') and is currently leading in score, playing Devil ends the game for victory!
  const devilCard = hand.find((c) => c.letter === 'D');
  if (devilCard && isWinning) {
    return devilCard;
  }

  // 2. If opponent's hand is known (or partially known):
  if (targetOpponent) {
    const knownDevil = targetOpponent.isRevealedToAll || targetOpponent.revealedToPlayers[cpuPlayer.id];
    if (knownDevil) {
      const hasDevilInTarget = targetOpponent.hand.some((c) => c.letter === 'D');
      const braveCard = hand.find((c) => c.letter === 'B');
      if (hasDevilInTarget && braveCard) {
        // High chance to play Brave to trigger instant victory!
        return braveCard;
      }

      const hasZeroInTarget = targetOpponent.hand.some((c) => c.letter === 'Z');
      const youthCard = hand.find((c) => c.letter === 'Y');
      if (hasZeroInTarget && youthCard) {
        return youthCard;
      }
    }
  }

  // 3. Check Revolution card ('R')
  const revCard = hand.find((c) => c.letter === 'R');
  if (revCard) {
    // If we have low cards (V, W, X, Y, Z), Revolution would make them top tier!
    const lowCardCount = hand.filter((c) => ['T', 'U', 'V', 'W', 'X', 'Y', 'Z'].includes(c.letter)).length;
    if (!isRevolution && lowCardCount >= 2 && Math.random() < 0.6) {
      return revCard;
    }
  }

  // 4. Preserve Amateras ('A') and Crystal dragon ('C') if possible for end-game bonus
  const nonBonusHand = hand.filter((c) => c.letter !== 'A' && c.letter !== 'C');
  const poolToPickFrom = nonBonusHand.length > 0 ? nonBonusHand : hand;

  // 5. Sort candidates by strength under current revolution rule
  const sorted = [...poolToPickFrom].sort((a, b) => compareCards(b, a, isRevolution));

  // If we have Fire Phoenix ('F') and haven't used it, it's a very safe play
  const phoenixCard = hand.find((c) => c.letter === 'F');
  if (phoenixCard && !cpuPlayer.firePhoenixUsed && Math.random() < 0.4) {
    return phoenixCard;
  }

  // 70% chance to play one of the stronger cards, 30% bluff or play draw-on-loss card
  if (Math.random() < 0.65) {
    return sorted[0]; // Strongest card
  } else {
    // Pick a card with nice loss effect (E, H, I, J, K, M, N, S, V, W, X)
    const lossEffectCard = poolToPickFrom.find((c) =>
      ['J', 'V', 'W', 'X', 'E', 'H', 'I', 'K', 'M', 'N', 'S'].includes(c.letter)
    );
    if (lossEffectCard) {
      return lossEffectCard;
    }
    return sorted[Math.floor(Math.random() * sorted.length)];
  }
};

export const selectCpuTargetOpponent = (
  cpuPlayer: Player,
  opponents: Player[]
): Player => {
  if (opponents.length === 1) return opponents[0];

  // Prefer challenging the leader (highest score) or someone with revealed hand
  const sortedByScore = [...opponents].sort((a, b) => b.score - a.score);
  if (Math.random() < 0.6) {
    return sortedByScore[0];
  }
  return opponents[Math.floor(Math.random() * opponents.length)];
};

export const selectCpuWerewolfDeckCard = (deck: CardData[], isRevolution: boolean): CardData => {
  // Prefer A (10pt + end game bonus) or D or B or top strength
  const aCard = deck.find((c) => c.letter === 'A');
  if (aCard) return aCard;
  const cCard = deck.find((c) => c.letter === 'C');
  if (cCard) return cCard;

  const sorted = [...deck].sort((a, b) => compareCards(b, a, isRevolution));
  return sorted[0];
};

export const selectCpuStealCard = (targetHand: CardData[], isRevolution: boolean): CardData => {
  if (targetHand.length === 0) throw new Error('Target hand empty');
  // Prefer A or C, or highest points
  const sorted = [...targetHand].sort((a, b) => {
    if (a.letter === 'A') return -1;
    if (b.letter === 'A') return 1;
    if (a.letter === 'C') return -1;
    if (b.letter === 'C') return 1;
    return b.points - a.points;
  });
  return sorted[0];
};
