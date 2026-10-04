import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { CardData, Player, GamePhase, BattleRecord, EffectInteractionState, GameLogEntry } from '../types/game';
import { getDeckList } from '../data/cards';

export interface RoomPlayer {
  id: string;
  name: string;
  avatarSeed: number;
  isHost: boolean;
  ready: boolean;
}

export interface OnlineGameState {
  players: Player[];
  turnPlayerIndex: number;
  drawPile: CardData[];
  discardPile: CardData[];
  isRevolution: boolean;
  turnNumber: number;
  gamePhase: GamePhase;
  challengerId: string | null;
  defenderId: string | null;
  challengerCard: CardData | null;
  defenderCard: CardData | null;
  battleReveal: boolean;
  battleRecord: BattleRecord | null;
  waitingForBattleNext: boolean;
  instantWinWinnerId: string | null;
  instantWinReason: string;
  turnInstruction: string;
  effectInteraction: EffectInteractionState | null;
  gameLogs: GameLogEntry[];
}

export interface OnlineRoomData {
  id: string;
  roomCode: string;
  hostId: string;
  maxPlayers: number;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  players: RoomPlayer[];
  gameState?: OnlineGameState;
  createdAt?: any;
  updatedAt?: any;
}

// Generate 6-digit room code
export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create a new room
export async function createOnlineRoom(
  hostName: string,
  maxPlayers: number
): Promise<{ roomId: string; roomCode: string; myPlayerId: string }> {
  const roomCode = generateRoomCode();
  const roomId = `room_${roomCode}`;
  const myPlayerId = `p_host_${Math.random().toString(36).substring(2, 9)}`;

  const hostPlayer: RoomPlayer = {
    id: myPlayerId,
    name: hostName || 'ホスト',
    avatarSeed: 1,
    isHost: true,
    ready: true,
  };

  const initialData: OnlineRoomData = {
    id: roomId,
    roomCode,
    hostId: myPlayerId,
    maxPlayers,
    status: 'LOBBY',
    players: [hostPlayer],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'rooms', roomId), initialData);
    return { roomId, roomCode, myPlayerId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}`);
  }
}

// Join an existing room by 6-digit code
export async function joinOnlineRoom(
  roomCode: string,
  playerName: string
): Promise<{ roomId: string; myPlayerId: string; room: OnlineRoomData }> {
  const cleanCode = roomCode.trim().replace(/\D/g, '');
  const roomId = `room_${cleanCode}`;

  try {
    const docRef = doc(db, 'rooms', roomId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('指定された合言葉の部屋が見つかりませんでした。番号をご確認ください。');
    }

    const room = snap.data() as OnlineRoomData;

    if (room.status !== 'LOBBY') {
      throw new Error('この部屋の対戦はすでに開始されているか、終了しています。');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('この部屋はすでに満員です。');
    }

    const myPlayerId = `p_guest_${Math.random().toString(36).substring(2, 9)}`;
    const newPlayer: RoomPlayer = {
      id: myPlayerId,
      name: playerName || `プレイヤー${room.players.length + 1}`,
      avatarSeed: room.players.length + 1,
      isHost: false,
      ready: true,
    };

    const updatedPlayers = [...room.players, newPlayer];

    await updateDoc(docRef, {
      players: updatedPlayers,
      updatedAt: new Date().toISOString(),
    });

    return { roomId, myPlayerId, room: { ...room, players: updatedPlayers } };
  } catch (error) {
    if (error instanceof Error && !error.message.includes('Firestore Error')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

// Start game in room (Host only)
export async function startOnlineGame(roomId: string, players: RoomPlayer[]): Promise<void> {
  const deck = [...getDeckList()];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const gamePlayers: Player[] = players.map((p, idx) => ({
    id: p.id,
    name: p.name,
    type: 'human',
    avatarSeed: p.avatarSeed || idx + 1,
    hand: deck.splice(0, 3),
    capturedCards: [],
    score: 0,
    firePhoenixUsed: false,
    isRevealedToAll: false,
    revealedToPlayers: {},
  }));

  const initialGameState: OnlineGameState = {
    players: gamePlayers,
    turnPlayerIndex: 0,
    drawPile: deck,
    discardPile: [],
    isRevolution: false,
    turnNumber: 1,
    gamePhase: 'SELECT_PLAY_CARD',
    challengerId: null,
    defenderId: null,
    challengerCard: null,
    defenderCard: null,
    battleReveal: false,
    battleRecord: null,
    waitingForBattleNext: false,
    instantWinWinnerId: null,
    instantWinReason: '',
    turnInstruction: `${gamePlayers[0].name} のターンです。手札からバトルに出すカードを選んでください。`,
    effectInteraction: null,
    gameLogs: [
      {
        id: 'start-log',
        turn: 1,
        text: 'オンライン対戦が開始されました！各プレイヤーに手札が3枚配られました。',
        type: 'special',
        timestamp: Date.now(),
      },
    ],
  };

  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      status: 'PLAYING',
      gameState: initialGameState,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

// Rematch game in room
export async function rematchOnlineGame(roomId: string, currentPlayers: RoomPlayer[]): Promise<void> {
  await startOnlineGame(roomId, currentPlayers);
}

// Update game state
export async function syncOnlineGameState(roomId: string, gameState: OnlineGameState): Promise<void> {
  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      gameState,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

// Subscribe to room updates
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: OnlineRoomData) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, 'rooms', roomId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as OnlineRoomData);
      }
    },
    (error) => {
      console.error('Room subscription error:', error);
      if (onError) onError(error);
    }
  );
}
