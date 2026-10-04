/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CardData,
  Player,
  GamePhase,
  BattleRecord,
  EffectInteractionState,
  GameLogEntry,
} from './types/game';
import { CARD_DATABASE, getDeckList, compareCards } from './data/cards';
import { sound } from './utils/audio';
import {
  selectCpuCardToPlay,
  selectCpuTargetOpponent,
  selectCpuWerewolfDeckCard,
  selectCpuStealCard,
} from './utils/ai';
import { HeaderNav } from './components/HeaderNav';
import { TitleScreen } from './components/TitleScreen';
import { BattleArena } from './components/BattleArena';
import { OpponentsBar, CurrentPlayerHand } from './components/PlayerBar';
import { CardCodexModal } from './components/CardCodexModal';
import { RulesModal } from './components/RulesModal';
import { LogModal } from './components/LogModal';
import { GameOverModal } from './components/GameOverModal';
import { EffectModal } from './components/EffectModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { PublicCardsModal } from './components/PublicCardsModal';
import { CustomImageModal } from './components/CustomImageModal';
import {
  OnlineGameState,
  OnlineRoomData,
  RoomPlayer,
  subscribeToRoom,
  syncOnlineGameState,
  rematchOnlineGame,
} from './utils/onlineGame';

export default function App() {
  // Game Setup State
  const [gamePhase, setGamePhase] = useState<GamePhase>('TITLE');
  const [players, setPlayers] = useState<Player[]>([]);
  const [turnPlayerIndex, setTurnPlayerIndex] = useState<number>(0);
  const [drawPile, setDrawPile] = useState<CardData[]>([]);
  const [discardPile, setDiscardPile] = useState<CardData[]>([]);
  const [isRevolution, setIsRevolution] = useState<boolean>(false);
  const [turnNumber, setTurnNumber] = useState<number>(1);

  // Online Multiplayer State
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');
  const [onlineRoomId, setOnlineRoomId] = useState<string | null>(null);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>('');
  const [myOnlinePlayerId, setMyOnlinePlayerId] = useState<string | null>(null);
  const [isOnlineMatch, setIsOnlineMatch] = useState<boolean>(false);
  const isRemoteSyncRef = useRef<boolean>(false);

  // Public Cards Inspector State
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);
  const [inspectTab, setInspectTab] = useState<'captured' | 'used'>('captured');
  const [isPublicCardsModalOpen, setIsPublicCardsModalOpen] = useState<boolean>(false);

  const handleOpenInspectPlayer = (target: Player, tab: 'captured' | 'used') => {
    setInspectPlayer(target);
    setInspectTab(tab);
    setIsPublicCardsModalOpen(true);
  };

  // Battle State
  const [challengerId, setChallengerId] = useState<string | null>(null);
  const [defenderId, setDefenderId] = useState<string | null>(null);
  const [challengerCard, setChallengerCard] = useState<CardData | null>(null);
  const [defenderCard, setDefenderCard] = useState<CardData | null>(null);
  const [battleReveal, setBattleReveal] = useState<boolean>(false);
  const [battleRecord, setBattleRecord] = useState<BattleRecord | null>(null);
  const [selectedHandCard, setSelectedHandCard] = useState<CardData | null>(null);
  const [turnInstruction, setTurnInstruction] = useState<string>('');
  const [waitingForBattleNext, setWaitingForBattleNext] = useState<boolean>(false);

  // Instant Win & Game Over
  const [instantWinWinnerId, setInstantWinWinnerId] = useState<string | null>(null);
  const [instantWinReason, setInstantWinReason] = useState<string>('');

  // Modals
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [isCustomImageModalOpen, setIsCustomImageModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [effectInteraction, setEffectInteraction] = useState<EffectInteractionState | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);

  // Sound toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Check for ?room= in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomCode(roomParam.trim());
      setIsOnlineModalOpen(true);
    }
  }, []);

  // Sync state to Firestore helper
  const syncToOnline = (override: Partial<OnlineGameState>) => {
    if (!isOnlineMatch || !onlineRoomId) return;
    const fullState: OnlineGameState = {
      players,
      turnPlayerIndex,
      drawPile,
      discardPile,
      isRevolution,
      turnNumber,
      gamePhase,
      challengerId,
      defenderId,
      challengerCard,
      defenderCard,
      battleReveal,
      battleRecord,
      waitingForBattleNext,
      instantWinWinnerId,
      instantWinReason,
      turnInstruction,
      effectInteraction,
      gameLogs,
      ...override,
    };
    syncOnlineGameState(onlineRoomId, fullState);
  };

  // Subscribe to room changes when in an online match
  useEffect(() => {
    if (!isOnlineMatch || !onlineRoomId) return;

    const unsubscribe = subscribeToRoom(onlineRoomId, (roomData) => {
      if (!roomData.gameState) return;
      const s = roomData.gameState;

      // Check for remote sounds
      if (s.battleReveal && !battleReveal) {
        sound.playClash();
      }
      if (s.isRevolution !== isRevolution) {
        sound.playRevolution();
      }
      if (s.instantWinWinnerId && !instantWinWinnerId) {
        sound.playInstantWin();
      }

      isRemoteSyncRef.current = true;
      setPlayers(s.players);
      setTurnPlayerIndex(s.turnPlayerIndex);
      setDrawPile(s.drawPile);
      setDiscardPile(s.discardPile);
      setIsRevolution(s.isRevolution);
      setTurnNumber(s.turnNumber);
      setGamePhase(s.gamePhase);
      setChallengerId(s.challengerId);
      setDefenderId(s.defenderId);
      setChallengerCard(s.challengerCard);
      setDefenderCard(s.defenderCard);
      setBattleReveal(s.battleReveal);
      setBattleRecord(s.battleRecord);
      setWaitingForBattleNext(s.waitingForBattleNext);
      setInstantWinWinnerId(s.instantWinWinnerId);
      setInstantWinReason(s.instantWinReason);
      setTurnInstruction(s.turnInstruction);
      setEffectInteraction(s.effectInteraction);
      setGameLogs(s.gameLogs || []);
    });

    return () => unsubscribe();
  }, [isOnlineMatch, onlineRoomId, battleReveal, isRevolution, instantWinWinnerId]);

  // Handle Online Game Started from Lobby
  const handleOnlineGameStarted = (
    roomId: string,
    myPlayerId: string,
    roomData: OnlineRoomData
  ) => {
    setOnlineRoomId(roomId);
    setOnlineRoomCode(roomData.roomCode);
    setMyOnlinePlayerId(myPlayerId);
    setIsOnlineMatch(true);
    setIsOnlineModalOpen(false);

    if (roomData.gameState) {
      const s = roomData.gameState;
      setPlayers(s.players);
      setTurnPlayerIndex(s.turnPlayerIndex);
      setDrawPile(s.drawPile);
      setDiscardPile(s.discardPile);
      setIsRevolution(s.isRevolution);
      setTurnNumber(s.turnNumber);
      setGamePhase(s.gamePhase);
      setTurnInstruction(s.turnInstruction);
      setGameLogs(s.gameLogs || []);
    }
  };

  // Helper: append log
  const addLog = (text: string, type: GameLogEntry['type'] = 'turn') => {
    setGameLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        turn: turnNumber,
        text,
        type,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // Start new game
  const handleStartGame = (config: {
    playerCount: number;
    mode: 'cpu' | 'local';
    playerName: string;
  }) => {
    // 1. Shuffle full 26 cards
    const deck = [...getDeckList()];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // 2. Create players
    const newPlayers: Player[] = [];
    const cpuNames = ['アルス (魔術師)', 'バルガス (重騎士)', 'セリア (暗殺者)'];

    // Player 1 (Human)
    newPlayers.push({
      id: 'p1',
      name: config.playerName || 'プレイヤー1',
      type: 'human',
      avatarSeed: 1,
      hand: [],
      capturedCards: [],
      usedCards: [],
      score: 0,
      firePhoenixUsed: false,
      isRevealedToAll: false,
      revealedToPlayers: {},
    });

    // Other players
    for (let i = 1; i < config.playerCount; i++) {
      const isCpu = config.mode === 'cpu';
      newPlayers.push({
        id: `p${i + 1}`,
        name: isCpu ? cpuNames[i - 1] : `プレイヤー${i + 1}`,
        type: isCpu ? 'cpu' : 'human',
        avatarSeed: i + 1,
        hand: [],
        capturedCards: [],
        usedCards: [],
        score: 0,
        firePhoenixUsed: false,
        isRevealedToAll: false,
        revealedToPlayers: {},
      });
    }

    // 3. Deal 3 cards to each player
    newPlayers.forEach((p) => {
      p.hand = deck.splice(0, 3);
    });

    setPlayers(newPlayers);
    setDrawPile(deck);
    setDiscardPile([]);
    setIsRevolution(false);
    setTurnPlayerIndex(0);
    setTurnNumber(1);
    setChallengerId(newPlayers[0].id);
    setDefenderId(null);
    setInstantWinWinnerId(null);
    setInstantWinReason('');
    setBattleRecord(null);
    setChallengerCard(null);
    setDefenderCard(null);
    setBattleReveal(false);
    setSelectedHandCard(null);
    setEffectInteraction(null);

    setGameLogs([
      {
        id: 'start',
        turn: 1,
        text: `ゲーム開始！各プレイヤーにカードを3枚配りました。（山札残り: ${deck.length}枚）`,
        type: 'special',
        timestamp: Date.now(),
      },
    ]);

    sound.playCardDraw();
    setGamePhase('PLAYER_TURN_DRAW');
  };

  // Turn step watcher
  useEffect(() => {
    if (players.length === 0) return;

    if (gamePhase === 'PLAYER_TURN_DRAW') {
      const activePlayer = players[turnPlayerIndex];
      if (!activePlayer) return;

      // Draw 1 card from deck
      if (drawPile.length === 0) {
        addLog('山札が尽きたため、これ以上ドローできません。ゲームを終了します。', 'special');
        setGamePhase('GAME_OVER');
        return;
      }

      const drawnCard = drawPile[0];
      const newDeck = drawPile.slice(1);
      setDrawPile(newDeck);

      const updatedPlayers = [...players];
      updatedPlayers[turnPlayerIndex] = {
        ...activePlayer,
        hand: [...activePlayer.hand, drawnCard],
      };
      setPlayers(updatedPlayers);
      sound.playCardDraw();

      addLog(`${activePlayer.name} のターン：山札からカードを1枚引きました。`, 'turn');

      setChallengerId(activePlayer.id);
      setChallengerCard(null);
      setDefenderId(null);
      setDefenderCard(null);
      setBattleReveal(false);
      setBattleRecord(null);
      setSelectedHandCard(null);
      setWaitingForBattleNext(false);

      if (activePlayer.type === 'human') {
        setTurnInstruction('手札から場に出すカードを1枚選択してください。');
        setGamePhase('SELECT_PLAY_CARD');
      } else {
        setTurnInstruction(`${activePlayer.name} がカードを選択中...`);
        setGamePhase('SELECT_PLAY_CARD');

        // CPU plays card after short realistic delay
        const timer = setTimeout(() => {
          const opponents = updatedPlayers.filter((p) => p.id !== activePlayer.id);
          const target = selectCpuTargetOpponent(activePlayer, opponents);

          const card = selectCpuCardToPlay({
            cpuPlayer: updatedPlayers[turnPlayerIndex],
            allPlayers: updatedPlayers,
            targetOpponent: target,
            isRevolution,
            deckCount: newDeck.length,
          });

          // Remove card from CPU hand
          updatedPlayers[turnPlayerIndex].hand = updatedPlayers[turnPlayerIndex].hand.filter(
            (c) => c.letter !== card.letter
          );
          setPlayers([...updatedPlayers]);
          setChallengerCard(card);
          setChallengerId(activePlayer.id);
          setDefenderId(target.id);

          sound.playCardFlip();
          addLog(`${activePlayer.name} はカードを伏せて場に出し、${target.name} にバトルを挑みました！`, 'battle');

          // Next: Defender select card
          handleDefenderTurn(target, card, updatedPlayers, isRevolution, newDeck.length);
        }, 800);

        return () => clearTimeout(timer);
      }
    }
  }, [gamePhase, turnPlayerIndex]);

  // Human player confirms playing card
  const handleHumanPlayCard = () => {
    if (!selectedHandCard) return;
    const activePlayer = players[turnPlayerIndex];
    if (!activePlayer) return;

    // Remove from hand
    const updatedPlayers = [...players];
    updatedPlayers[turnPlayerIndex] = {
      ...activePlayer,
      hand: activePlayer.hand.filter((c) => c.letter !== selectedHandCard.letter),
    };
    setPlayers(updatedPlayers);
    setChallengerCard(selectedHandCard);
    setChallengerId(activePlayer.id);
    setSelectedHandCard(null);

    sound.playCardFlip();

    const opponents = updatedPlayers.filter((p) => p.id !== activePlayer.id);
    if (opponents.length === 1) {
      // Auto select only opponent
      const target = opponents[0];
      setDefenderId(target.id);
      addLog(`${activePlayer.name} はカードを伏せて場に出し、${target.name} に対戦を挑みました！`, 'battle');
      handleDefenderTurn(target, selectedHandCard, updatedPlayers, isRevolution, drawPile.length);
    } else {
      setTurnInstruction('バトルを挑む対戦相手を選択してください。');
      setGamePhase('SELECT_OPPONENT');
      if (isOnlineMatch) {
        syncToOnline({
          players: updatedPlayers,
          challengerCard: selectedHandCard,
          gamePhase: 'SELECT_OPPONENT',
          turnInstruction: 'バトルを挑む対戦相手を選択してください。',
        });
      }
    }
  };

  // Human selects opponent from bar
  const handleHumanSelectOpponent = (target: Player) => {
    setDefenderId(target.id);
    const activePlayer = players[turnPlayerIndex];
    addLog(`${activePlayer.name} は ${target.name} に対戦を挑みました！`, 'battle');
    if (challengerCard) {
      handleDefenderTurn(target, challengerCard, players, isRevolution, drawPile.length);
    }
  };

  // Defender selects their card
  const handleDefenderTurn = (
    defender: Player,
    currentChallengerCard: CardData,
    currentPlayers: Player[],
    currentRevolution: boolean,
    currentDeckCount: number
  ) => {
    setGamePhase('OPPONENT_SELECT_CARD');

    if (defender.type === 'cpu') {
      setTurnInstruction(`${defender.name} が応戦するカードを選択中...`);
      setTimeout(() => {
        const defenderPlayer = currentPlayers.find((p) => p.id === defender.id)!;
        const card = selectCpuCardToPlay({
          cpuPlayer: defenderPlayer,
          allPlayers: currentPlayers,
          isRevolution: currentRevolution,
          deckCount: currentDeckCount,
        });

        // Remove from defender hand
        defenderPlayer.hand = defenderPlayer.hand.filter((c) => c.letter !== card.letter);
        setPlayers([...currentPlayers]);
        setDefenderCard(card);

        sound.playCardFlip();
        addLog(`${defender.name} はカードを伏せて応戦しました！`, 'battle');

        const activeChallenger = currentPlayers.find((p) => p.id === challengerId);
        const hasHumanParticipant = activeChallenger?.type === 'human' || defender.type === 'human';

        if (hasHumanParticipant) {
          setTurnInstruction(`両者のカードが伏せられました。「勝負する！」を押して開示してください！`);
          setGamePhase('READY_TO_CLASH');
        } else {
          // Both are CPUs, resolve automatically after short suspense
          setTimeout(() => {
            resolveBattle(currentChallengerCard, card, currentPlayers, currentRevolution);
          }, 1000);
        }
      }, 700);
    } else {
      // Human defender (Local or Online)
      const instruction = `${defender.name} の応戦：手札から出すカードを選択してください。`;
      setTurnInstruction(instruction);
      if (isOnlineMatch) {
        syncToOnline({
          players: currentPlayers,
          challengerCard: currentChallengerCard,
          defenderId: defender.id,
          gamePhase: 'OPPONENT_SELECT_CARD',
          turnInstruction: instruction,
        });
      }
    }
  };

  // Human defender picks card
  const handleHumanDefenderPlayCard = () => {
    if (!selectedHandCard || !challengerCard || !defenderId) return;
    const defender = players.find((p) => p.id === defenderId);
    if (!defender) return;

    const updatedPlayers = [...players];
    const defIndex = updatedPlayers.findIndex((p) => p.id === defenderId);
    updatedPlayers[defIndex] = {
      ...defender,
      hand: defender.hand.filter((c) => c.letter !== selectedHandCard.letter),
    };
    setPlayers(updatedPlayers);
    setDefenderCard(selectedHandCard);
    setSelectedHandCard(null);

    sound.playCardFlip();
    addLog(`${defender.name} は応戦カードを伏せて出しました！`, 'battle');

    const clashInstruction = '両者のカードが揃いました！「勝負する！」を押してオープンしてください！';
    setTurnInstruction(clashInstruction);
    setGamePhase('READY_TO_CLASH');

    if (isOnlineMatch) {
      syncToOnline({
        players: updatedPlayers,
        defenderCard: selectedHandCard,
        gamePhase: 'READY_TO_CLASH',
        turnInstruction: clashInstruction,
      });
    }
  };

  // Trigger clash reveal on "勝負する！" button click
  const handleStartClash = () => {
    if (!challengerCard || !defenderCard) return;
    sound.playClick();
    resolveBattle(challengerCard, defenderCard, players, isRevolution);
  };

  // Core Battle Resolution Logic
  const resolveBattle = (
    cCard: CardData,
    dCard: CardData,
    currentPlayers: Player[],
    currentRevolution: boolean
  ) => {
    setGamePhase('BATTLE_REVEAL');
    setBattleReveal(true);
    sound.playClash();

    const activeChallengerId = challengerId || currentPlayers[turnPlayerIndex]?.id || currentPlayers[0]?.id;
    let challenger = currentPlayers.find((p) => p.id === activeChallengerId) || currentPlayers[turnPlayerIndex] || currentPlayers[0];
    let defender = currentPlayers.find((p) => p.id === defenderId) || currentPlayers.find((p) => p.id !== challenger.id) || currentPlayers[1] || currentPlayers[0];

    // Compare cards
    const comp = compareCards(cCard, dCard, currentRevolution);
    let winner: Player;
    let loser: Player;
    let winnerCard: CardData;
    let loserCard: CardData;

    if (comp >= 0) {
      winner = challenger;
      loser = defender;
      winnerCard = cCard;
      loserCard = dCard;
    } else {
      winner = defender;
      loser = challenger;
      winnerCard = dCard;
      loserCard = cCard;
    }

    addLog(`【開示】${challenger.name}の「${cCard.letter}: ${cCard.japaneseName}」 vs ${defender.name}の「${dCard.letter}: ${dCard.japaneseName}」！ 勝者：${winner.name}`, 'battle');

    const effects: string[] = [];
    let instantWinner: string | null = null;
    let instantReason = '';
    let revChanged = false;
    let newRevolution = currentRevolution;
    let shouldEndGameAfterBattle = false;

    // 1. Instant Win Conditions
    // Brave (B) vs Devil (D)
    if (winnerCard.letter === 'B' && loserCard.letter === 'D') {
      instantWinner = winner.id;
      instantReason = `勇者（B）が魔王（D）を討伐！【特殊完全勝利】`;
      sound.playInstantWin();
      effects.push('勇者の魔王討伐：ゲームが即座に終了し、勇者の完全勝利！');
      addLog(`★★特異点発生！ ${winner.name}（勇者）が魔王（D）を討滅し、完全勝利！★★`, 'win');
    }

    // Youth (Y) vs Zero (Z)
    if (winnerCard.letter === 'Y' && loserCard.letter === 'Z') {
      instantWinner = winner.id;
      instantReason = `青年（Y）がゼロ（Z）に勝利！【奇跡の完全勝利】`;
      sound.playInstantWin();
      effects.push('青年の奇跡：ゼロに勝利し、ポイント無関係に完全勝利！');
      addLog(`★★特異点発生！ ${winner.name}（青年）がゼロ（Z）を撃破し、完全勝利！★★`, 'win');
    }

    // 2. Card Effect Negation: Unicorn (U)
    // "バトルに勝った場合、このバトルでのカードの効果をすべて無効にする。"
    const isUnicornNegated = winnerCard.letter === 'U';
    if (isUnicornNegated) {
      effects.push('ユニコーンの効果：このバトルにおけるすべてのカード効果を完全無効化！');
      addLog('ユニコーンの聖なる角が、この戦闘のすべての効果を浄化・無効化しました。', 'effect');
    }

    // 3. Gargoyle (G):
    // "バトルに勝った場合、このバトルでの自分に対するカードの効果を受けない。"
    const isGargoyleImmune = winnerCard.letter === 'G';
    if (isGargoyleImmune) {
      effects.push('ガーゴイルの効果：自身を対象とするカード効果を無効化！');
    }

    // Process effects if NOT negated by Unicorn
    let firePhoenixReturned = false;
    let loserDraws = 0;
    let leviathanShuffle = false;
    let interactionNeeded: EffectInteractionState | null = null;
    let currentDrawPile = [...drawPile];

    if (!isUnicornNegated && !instantWinner) {
      // Check Revolutionary (R) - Winner effect
      // "バトルに勝った場合、全てのカードの強さが逆転する。"
      if (winnerCard.letter === 'R') {
        newRevolution = !currentRevolution;
        revChanged = true;
        setIsRevolution(newRevolution);
        sound.playRevolution();
        effects.push(`革命発生！カード強弱が逆転！ (${newRevolution ? 'Zが最強、Aが最弱' : '通常秩序に戻る'})`);
        addLog(`革命家の演説が響き渡る！ 世界の序列が逆転しました！（${newRevolution ? 'Z最強' : 'A最強'}）`, 'special');
      }

      // Check Devil (D) - "バトル終了後、ゲームを終了する。（相手の効果は発動する。）"
      if (winnerCard.letter === 'D' || loserCard.letter === 'D') {
        shouldEndGameAfterBattle = true;
        effects.push('魔王の効果：このバトル終了後、世界（ゲーム）が終焉を迎える！');
        addLog('魔王の凶兆：戦闘終了後、ゲームが強制終了します。', 'special');
      }

      // Loser Card Effects:
      switch (loserCard.letter) {
        // Fire phoenix (F):
        // "バトルに負けた場合、相手のポイントにせず手札に戻す。この効果はゲーム中1度のみ発動する。"
        case 'F':
          if (!loser.firePhoenixUsed) {
            firePhoenixReturned = true;
            effects.push('火の鳥の効果：不死の力により手札に生還！相手の得点にならない (1度のみ)');
            addLog(`${loser.name} の火の鳥が灰から蘇り、手札へと舞い戻りました！`, 'effect');
          }
          break;

        // Draw on loss: E, H, I, K, M, N, S
        case 'E':
        case 'H':
        case 'I':
        case 'K':
        case 'M':
        case 'N':
        case 'S':
          loserDraws = 1;
          effects.push(`${loserCard.japaneseName}の効果：敗北により山札から1枚ドロー`);
          addLog(`${loser.name} は「${loserCard.japaneseName}」の敗北時効果で山札からカードを引きます。`, 'effect');
          break;

        // Joker (J):
        // "バトルに負けた場合、全員の手札からカードを見ずに1枚指定して捨てさせ自分のポイントに加える。"
        case 'J':
          effects.push('死神の効果：他プレイヤーの手札から1枚ずつ奪って自らの得点に！');
          addLog(`${loser.name} の死神が鎌を振るい、他プレイヤーの手札を狩り取ります！`, 'effect');
          break;

        // Leviathan (L):
        // "バトルに負けた場合、全員の手札を回収して山札とともにシャッフルして同じ枚数配りなおす。"
        case 'L':
          leviathanShuffle = true;
          effects.push('リヴァイアサンの効果：全員の手札と山札を合体リシャッフル再配布！');
          addLog(`${loser.name} のリヴァイアサンが大津波を起こし、全員の手札と山札を再分配！`, 'special');
          break;

        // Ogre (O):
        // "バトルに負けた場合、相手の手札を見る。"
        case 'O':
          if (!isGargoyleImmune) {
            effects.push(`オーガの効果：${winner.name}の手札を覗き見る`);
            addLog(`${loser.name} はオーガの瞳で ${winner.name} の手札を見通しました。`, 'effect');
          }
          break;

        // Prince (P):
        // "バトルに負けた場合、相手の手札を全員に公開させる。"
        case 'P':
          if (!isGargoyleImmune) {
            effects.push(`王子の効果：${winner.name}の手札を全員に公開！`);
            addLog(`${loser.name} の王子が告発！ ${winner.name} の手札が全員に白日の下に晒されました。`, 'effect');
          }
          break;

        // Queen (Q):
        // "バトルに負けた場合、プレイヤーを1人指名して手札を全員に公開させる。"
        case 'Q':
          effects.push('女王の効果：指名したプレイヤーの手札を全員公開');
          if (loser.type === 'human') {
            interactionNeeded = {
              type: 'QUEEN_SELECT_PLAYER',
              actorPlayerId: loser.id,
              candidatePlayers: currentPlayers.filter((p) => p.id !== loser.id),
              description: '女王の勅命：手札を公開させるプレイヤーを1人指名してください。',
            };
          } else {
            // CPU nominates the leader
            const candidates = currentPlayers.filter((p) => p.id !== loser.id);
            const target = candidates.sort((a, b) => b.score - a.score)[0];
            if (target) {
              target.isRevealedToAll = true;
              addLog(`女王の命により、${target.name} の手札が全員に公開されました！`, 'effect');
            }
          }
          break;

        // Troll (T):
        // "バトルに負けた場合、全員の手札を見る。"
        case 'T':
          effects.push('トロールの効果：全員の手札を見通す');
          addLog(`${loser.name} はトロールの巨体で全員の手札を覗き込みました。`, 'effect');
          break;

        // Vampire (V):
        // "バトルに負けた場合、相手の手札を見て好きなカードを手札に加える。"
        case 'V':
          if (!isGargoyleImmune && winner.hand.length > 0) {
            effects.push(`吸血鬼の効果：${winner.name}の手札から1枚強奪！`);
            if (loser.type === 'human') {
              interactionNeeded = {
                type: 'VAMPIRE_STEAL',
                actorPlayerId: loser.id,
                targetPlayerId: winner.id,
                availableCards: [...winner.hand],
                description: `${winner.name} の手札から1枚選んで自分の手札に加えてください。`,
              };
            } else {
              // CPU steals best card
              const stolen = selectCpuStealCard(winner.hand, newRevolution);
              winner.hand = winner.hand.filter((c) => c.letter !== stolen.letter);
              loser.hand.push(stolen);
              addLog(`${loser.name} の吸血鬼は ${winner.name} から「${stolen.japaneseName}」を奪い去りました！`, 'effect');
            }
          }
          break;

        // Werewolf (W):
        // "バトルに負けた場合、山札のすべてのカードを見て好きなカードを1枚手札に加える。"
        case 'W':
          if (currentDrawPile.length > 0) {
            effects.push('狼男の効果：山札の全カードを見て好きな1枚をサーチ！');
            if (loser.type === 'human') {
              interactionNeeded = {
                type: 'WEREWOLF_SEARCH_DECK',
                actorPlayerId: loser.id,
                availableCards: [...currentDrawPile],
                description: '山札の中から好きなカードを1枚選んで手札に加えてください。',
              };
            } else {
              // CPU searches best card
              const picked = selectCpuWerewolfDeckCard(currentDrawPile, newRevolution);
              currentDrawPile = currentDrawPile.filter((c) => c.letter !== picked.letter);
              loser.hand.push(picked);
              addLog(`${loser.name} の狼男は山札の深淵から「${picked.japaneseName}」を嗅ぎつけ手札に加えました！`, 'effect');
            }
          }
          break;

        // Xenos (X):
        // "バトルに負けた場合、全員の手札を見て好きなカードを1枚手札に加える。"
        case 'X':
          const otherHands = currentPlayers
            .filter((p) => p.id !== loser.id && !(isGargoyleImmune && p.id === winner.id))
            .flatMap((p) => p.hand);

          if (otherHands.length > 0) {
            effects.push('異世界人の効果：全員の手札を見て好きな1枚を強奪！');
            if (loser.type === 'human') {
              interactionNeeded = {
                type: 'XENOS_STEAL',
                actorPlayerId: loser.id,
                availableCards: otherHands,
                description: '他プレイヤーの手札から好きなカードを1枚選んで奪ってください。',
              };
            } else {
              const stolen = selectCpuStealCard(otherHands, newRevolution);
              // Find and remove from owner
              for (const p of currentPlayers) {
                if (p.id !== loser.id) {
                  const idx = p.hand.findIndex((c) => c.letter === stolen.letter);
                  if (idx !== -1) {
                    p.hand.splice(idx, 1);
                    break;
                  }
                }
              }
              loser.hand.push(stolen);
              addLog(`${loser.name} の異世界人は次元を超えて「${stolen.japaneseName}」を我が物としました！`, 'effect');
            }
          }
          break;
      }
    }

    // Apply hand visibility for Ogre, Troll, Prince
    if (!isUnicornNegated) {
      if (loserCard.letter === 'P' && !isGargoyleImmune) {
        winner.isRevealedToAll = true;
      }
      if (loserCard.letter === 'O' && !isGargoyleImmune) {
        winner.revealedToPlayers[loser.id] = true;
      }
      if (loserCard.letter === 'T') {
        currentPlayers.forEach((p) => {
          if (p.id !== loser.id && !(isGargoyleImmune && p.id === winner.id)) {
            p.revealedToPlayers[loser.id] = true;
          }
        });
      }
    }

    // Apply Joker hand steal discard
    if (!isUnicornNegated && loserCard.letter === 'J') {
      currentPlayers.forEach((p) => {
        if (p.id !== loser.id && p.hand.length > 0 && !(isGargoyleImmune && p.id === winner.id)) {
          const randomIndex = Math.floor(Math.random() * p.hand.length);
          const discarded = p.hand.splice(randomIndex, 1)[0];
          loser.capturedCards.push(discarded);
          loser.score += discarded.points;
          addLog(`${loser.name} の死神は ${p.name} の手札から「${discarded.japaneseName}」を刈り取り、自分の得点としました！`, 'effect');
        }
      });
    }

    // Apply Leviathan hand shuffle
    if (leviathanShuffle) {
      const handCounts = currentPlayers.map((p) => p.hand.length);
      const allCards = [...currentPlayers.flatMap((p) => p.hand), ...currentDrawPile];
      // Shuffle
      for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
      }
      currentPlayers.forEach((p, idx) => {
        p.hand = allCards.splice(0, handCounts[idx]);
      });
      currentDrawPile = allCards;
      sound.playCardDraw();
    }

    // Apply loser draw if E, H, I, K, M, N, S (Consumes card from currentDrawPile!)
    if (loserDraws > 0 && currentDrawPile.length > 0) {
      const drawn = currentDrawPile[0];
      currentDrawPile = currentDrawPile.slice(1);
      loser.hand.push(drawn);
      sound.playCardDraw();
      addLog(`${loser.name} は「${loserCard.japaneseName}」の効果で山札から「${drawn.japaneseName}」を引きました。`, 'effect');
    }

    // Points & Capture calculation:
    // "勝者は自分のカードは使用済みとして所持し、相手のカードをポイントとして所持する。"
    if (firePhoenixReturned) {
      loser.hand.push(loserCard);
      loser.firePhoenixUsed = true;
    } else {
      winner.capturedCards.push(loserCard);
      winner.score += loserCard.points;
    }

    // 勝者は自分のカードを使用済みとして所持
    winner.usedCards.push(winnerCard);

    // Save record
    const record: BattleRecord = {
      turnNumber,
      challengerId: challenger.id,
      challengerCard: cCard,
      defenderId: defender.id,
      defenderCard: dCard,
      winnerId: winner.id,
      loserId: loser.id,
      instantWinWinnerId: instantWinner,
      effectsTriggered: effects,
      revolutionChanged: revChanged,
      isRevolutionActiveAtBattle: currentRevolution,
    };
    setBattleRecord(record);

    if (instantWinner) {
      setInstantWinWinnerId(instantWinner);
      setInstantWinReason(instantReason);
    }

    // Update state with updated players and new draw pile
    setPlayers([...currentPlayers]);
    setDrawPile(currentDrawPile);

    // If interaction modal needed (e.g. human Werewolf search, Vampire steal)
    if (interactionNeeded) {
      setEffectInteraction(interactionNeeded);
      setGamePhase('EFFECT_INTERACTION');
    } else {
      // Normal advance
      setWaitingForBattleNext(true);
    }

    // Sync battle result to online room
    if (isOnlineMatch) {
      syncToOnline({
        players: [...currentPlayers],
        drawPile: currentDrawPile,
        discardPile: [...discardPile],
        isRevolution: newRevolution,
        battleRecord: record,
        battleReveal: true,
        challengerCard: cCard,
        defenderCard: dCard,
        instantWinWinnerId: instantWinner,
        instantWinReason: instantReason,
        effectInteraction: interactionNeeded,
        gamePhase: interactionNeeded ? 'EFFECT_INTERACTION' : 'BATTLE_REVEAL',
        waitingForBattleNext: !interactionNeeded,
      });
    }
  };

  // Continue to next turn from Battle result
  const handleAdvanceTurn = () => {
    sound.playClick();

    if (instantWinWinnerId) {
      setGamePhase('GAME_OVER');
      if (isOnlineMatch) syncToOnline({ gamePhase: 'GAME_OVER' });
      return;
    }

    // Did Devil fight conclude?
    if (battleRecord && (battleRecord.challengerCard.letter === 'D' || battleRecord.defenderCard.letter === 'D')) {
      addLog('魔王の出現により世界が閉ざされました。ゲーム終了！', 'special');
      setGamePhase('GAME_OVER');
      if (isOnlineMatch) syncToOnline({ gamePhase: 'GAME_OVER' });
      return;
    }

    // Is draw pile empty?
    if (drawPile.length === 0) {
      addLog('山札が尽きたためゲーム終了！', 'special');
      setGamePhase('GAME_OVER');
      if (isOnlineMatch) syncToOnline({ gamePhase: 'GAME_OVER' });
      return;
    }

    // 次はバトルに敗北したプレイヤーの番となる
    let nextIndex = (turnPlayerIndex + 1) % players.length;
    if (battleRecord?.loserId) {
      const loserIndex = players.findIndex((p) => p.id === battleRecord.loserId);
      if (loserIndex !== -1) {
        nextIndex = loserIndex;
      }
    }

    const drawnCard = drawPile[0];
    const newDrawPile = drawPile.slice(1);
    const updatedPlayers = [...players];
    const nextPlayer = updatedPlayers[nextIndex];
    updatedPlayers[nextIndex] = {
      ...nextPlayer,
      hand: [...nextPlayer.hand, drawnCard],
    };

    const nextTurnNum = turnNumber + 1;
    const nextInstruction = `${nextPlayer.name}（敗北側）の手番です。手札から場に出すカードを選択してください。`;

    setPlayers(updatedPlayers);
    setDrawPile(newDrawPile);
    setTurnPlayerIndex(nextIndex);
    setTurnNumber(nextTurnNum);
    setChallengerId(nextPlayer.id);
    setDefenderId(null);
    setChallengerCard(null);
    setDefenderCard(null);
    setBattleReveal(false);
    setBattleRecord(null);
    setSelectedHandCard(null);
    setWaitingForBattleNext(false);
    setTurnInstruction(nextInstruction);
    setGamePhase('SELECT_PLAY_CARD');

    sound.playCardDraw();
    addLog(`${nextPlayer.name}（敗北者）の手番：山札からカードを1枚引きました。`, 'turn');

    if (isOnlineMatch) {
      syncToOnline({
        players: updatedPlayers,
        drawPile: newDrawPile,
        turnPlayerIndex: nextIndex,
        turnNumber: nextTurnNum,
        challengerId: nextPlayer.id,
        defenderId: null,
        challengerCard: null,
        defenderCard: null,
        battleReveal: false,
        battleRecord: null,
        waitingForBattleNext: false,
        turnInstruction: nextInstruction,
        gamePhase: 'SELECT_PLAY_CARD',
      });
    }
  };

  // Resolve Human Effect Interactions
  const handleSelectInteractionCard = (card: CardData) => {
    if (!effectInteraction) return;

    // Security check: Only the actor can choose!
    if (humanPlayer && effectInteraction.actorPlayerId && effectInteraction.actorPlayerId !== humanPlayer.id) {
      return;
    }

    const updatedPlayers = [...players];
    const actor = updatedPlayers.find((p) => p.id === effectInteraction.actorPlayerId);
    if (!actor) return;

    let updatedDrawPile = [...drawPile];

    if (effectInteraction.type === 'WEREWOLF_SEARCH_DECK') {
      updatedDrawPile = updatedDrawPile.filter((c) => c.letter !== card.letter);
      setDrawPile(updatedDrawPile);
      actor.hand.push(card);
      addLog(`${actor.name} は山札から「${card.japaneseName}」を選び手札に加えました！`, 'effect');
    } else if (effectInteraction.type === 'VAMPIRE_STEAL' || effectInteraction.type === 'XENOS_STEAL') {
      // Remove from target player
      for (const p of updatedPlayers) {
        if (p.id !== actor.id) {
          const idx = p.hand.findIndex((c) => c.letter === card.letter);
          if (idx !== -1) {
            p.hand.splice(idx, 1);
            break;
          }
        }
      }
      actor.hand.push(card);
      addLog(`${actor.name} は「${card.japaneseName}」を強奪して手札に加えました！`, 'effect');
    }

    setPlayers(updatedPlayers);
    setEffectInteraction(null);
    setWaitingForBattleNext(true);

    if (isOnlineMatch) {
      syncToOnline({
        players: updatedPlayers,
        drawPile: updatedDrawPile,
        effectInteraction: null,
        waitingForBattleNext: true,
      });
    }
  };

  const handleSelectInteractionPlayer = (targetPlayer: Player) => {
    if (!effectInteraction) return;

    // Security check: Only the actor can choose!
    if (humanPlayer && effectInteraction.actorPlayerId && effectInteraction.actorPlayerId !== humanPlayer.id) {
      return;
    }

    const updatedPlayers = [...players];
    const target = updatedPlayers.find((p) => p.id === targetPlayer.id);
    if (target) {
      target.isRevealedToAll = true;
      addLog(`女王の指名により、${target.name} の手札が全員に公開されました！`, 'effect');
    }
    setPlayers(updatedPlayers);
    setEffectInteraction(null);
    setWaitingForBattleNext(true);

    if (isOnlineMatch) {
      syncToOnline({
        players: updatedPlayers,
        effectInteraction: null,
        waitingForBattleNext: true,
      });
    }
  };

  // Helper to copy room invite link
  const handleCopyRoomLink = () => {
    if (!onlineRoomCode) return;
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}?room=${onlineRoomCode}`;
    navigator.clipboard.writeText(url);
    addLog(`招待リンクをコピーしました: ${url}`, 'special');
  };

  // Handle Game Restart / Rematch
  const handleRestartGame = async () => {
    if (isOnlineMatch && onlineRoomId) {
      sound.playBattleStart();
      const roomPlayers: RoomPlayer[] = players.map((p, idx) => ({
        id: p.id,
        name: p.name,
        avatarSeed: p.avatarSeed,
        isHost: idx === 0,
        ready: true,
      }));
      await rematchOnlineGame(onlineRoomId, roomPlayers);
    } else {
      setGamePhase('TITLE');
    }
  };

  const humanPlayer = isOnlineMatch && myOnlinePlayerId
    ? (players.find((p) => p.id === myOnlinePlayerId) || players[0])
    : (players.find((p) => p.type === 'human') || players[0]);
  const opponents = players.filter((p) => p.id !== humanPlayer?.id);

  // Turn checks for Human Player
  const isHumanTurn = players[turnPlayerIndex]?.id === humanPlayer?.id;
  const isHumanChallenged =
    gamePhase === 'OPPONENT_SELECT_CARD' && defenderId === humanPlayer?.id;

  const canHumanPlayCard =
    (isHumanTurn && gamePhase === 'SELECT_PLAY_CARD') || isHumanChallenged;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-serif-jp select-none w-full max-w-full overflow-x-hidden">
      
      {/* 3-Zone Header Nav Contract */}
      <HeaderNav
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenCodex={() => setIsCodexOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenLog={() => setIsLogOpen(true)}
        onOpenCustomImages={() => setIsCustomImageModalOpen(true)}
        onNewGame={() => {
          setIsOnlineMatch(false);
          setOnlineRoomId(null);
          setGamePhase('TITLE');
        }}
        onlineRoomCode={isOnlineMatch ? onlineRoomCode : undefined}
        onCopyRoomCode={handleCopyRoomLink}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col items-center justify-between p-1.5 sm:p-4 w-full max-w-full sm:max-w-5xl mx-auto box-border overflow-x-hidden">
        {gamePhase === 'TITLE' ? (
          <TitleScreen
            onStartGame={handleStartGame}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenCodex={() => setIsCodexOpen(true)}
            onOpenOnline={() => setIsOnlineModalOpen(true)}
            onOpenCustomImages={() => setIsCustomImageModalOpen(true)}
          />
        ) : (
          <div className="w-full max-w-full flex-1 flex flex-col justify-between gap-2.5 sm:gap-4 box-border">
            
            {/* Top Area: Opponents */}
            <OpponentsBar
              opponents={opponents}
              activePlayerId={players[turnPlayerIndex]?.id}
              isSelectOpponentPhase={isHumanTurn && gamePhase === 'SELECT_OPPONENT'}
              onSelectOpponent={handleHumanSelectOpponent}
              viewerPlayerId={humanPlayer?.id || 'p1'}
              onInspectPlayer={handleOpenInspectPlayer}
            />

            {/* Center Area: Battle Arena */}
            <BattleArena
              challenger={players.find((p) => p.id === challengerId) || null}
              defender={players.find((p) => p.id === defenderId) || null}
              challengerCard={challengerCard}
              defenderCard={defenderCard}
              battleReveal={battleReveal}
              battleRecord={battleRecord}
              isRevolution={isRevolution}
              deckCount={drawPile.length}
              discardCount={discardPile.length}
              onContinue={handleAdvanceTurn}
              waitingForPlayerAction={waitingForBattleNext}
              onStartClash={handleStartClash}
              onOpenRules={() => setIsRulesOpen(true)}
            />

            {/* Bottom Area: Human Player's Rack */}
            {humanPlayer && (
              <CurrentPlayerHand
                player={humanPlayer}
                isMyTurn={isHumanTurn}
                canPlayCard={canHumanPlayCard}
                selectedCard={selectedHandCard}
                onSelectCard={setSelectedHandCard}
                onConfirmPlayCard={() => {
                  if (isHumanTurn) {
                    handleHumanPlayCard();
                  } else if (isHumanChallenged) {
                    handleHumanDefenderPlayCard();
                  }
                }}
                turnInstruction={turnInstruction}
                onInspectPlayer={handleOpenInspectPlayer}
                onOpenRules={() => setIsRulesOpen(true)}
              />
            )}

          </div>
        )}
      </main>

      {/* Interactive Effect Modals */}
      <EffectModal
        interaction={effectInteraction}
        viewerPlayerId={humanPlayer?.id}
        actorPlayerName={players.find((p) => p.id === effectInteraction?.actorPlayerId)?.name}
        onSelectCard={handleSelectInteractionCard}
        onSelectPlayer={handleSelectInteractionPlayer}
        onClose={() => setEffectInteraction(null)}
      />

      {/* Card Codex Modal (A-Z) */}
      <CardCodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        isRevolution={isRevolution}
        onOpenCustomImages={() => setIsCustomImageModalOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        onOpenCodex={() => {
          setIsRulesOpen(false);
          setIsCodexOpen(true);
        }}
      />

      {/* Battle Log History */}
      <LogModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        logs={gameLogs}
      />

      {/* Custom Card Artworks Modal */}
      <CustomImageModal
        isOpen={isCustomImageModalOpen}
        onClose={() => setIsCustomImageModalOpen(false)}
      />

      {/* Game Over Victory Screen */}
      <GameOverModal
        isOpen={gamePhase === 'GAME_OVER'}
        players={players}
        instantWinWinnerId={instantWinWinnerId}
        instantWinReason={instantWinReason}
        onRestart={handleRestartGame}
        onOpenCodex={() => setIsCodexOpen(true)}
      />

      {/* Public Cards Inspector Modal (ポイントカード・使用済みカード確認) */}
      <PublicCardsModal
        isOpen={isPublicCardsModalOpen}
        onClose={() => setIsPublicCardsModalOpen(false)}
        targetPlayer={inspectPlayer}
        initialTab={inspectTab}
      />

      {/* Online Lobby Modal */}
      <OnlineLobbyModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onGameStarted={handleOnlineGameStarted}
        initialRoomCode={initialRoomCode}
      />

    </div>
  );
}
