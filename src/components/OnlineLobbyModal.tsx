import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Play,
  ArrowLeft,
  Crown,
  Sparkles,
  Loader2,
  Globe,
  Radio,
} from 'lucide-react';
import { sound } from '../utils/audio';
import {
  OnlineRoomData,
  RoomPlayer,
  createOnlineRoom,
  joinOnlineRoom,
  startOnlineGame,
  subscribeToRoom,
} from '../utils/onlineGame';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameStarted: (roomId: string, myPlayerId: string, initialRoom: OnlineRoomData) => void;
  initialRoomCode?: string;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  onClose,
  onGameStarted,
  initialRoomCode = '',
}) => {
  const [tab, setTab] = useState<'CHOICE' | 'CREATE' | 'JOIN' | 'LOBBY'>(
    initialRoomCode ? 'JOIN' : 'CHOICE'
  );
  const [playerName, setPlayerName] = useState<string>('プレイヤー');
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [inputRoomCode, setInputRoomCode] = useState<string>(initialRoomCode);

  // Active Room state
  const [activeRoom, setActiveRoom] = useState<OnlineRoomData | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Subscribe to room updates while in LOBBY
  useEffect(() => {
    if (!activeRoom?.id || tab !== 'LOBBY') return;

    const unsubscribe = subscribeToRoom(activeRoom.id, (updatedRoom) => {
      setActiveRoom(updatedRoom);
      // If status changed to PLAYING, start the game for guest
      if (updatedRoom.status === 'PLAYING' && updatedRoom.gameState) {
        onGameStarted(updatedRoom.id, myPlayerId, updatedRoom);
      }
    });

    return () => unsubscribe();
  }, [activeRoom?.id, tab, myPlayerId, onGameStarted]);

  useEffect(() => {
    if (initialRoomCode) {
      setInputRoomCode(initialRoomCode);
      setTab('JOIN');
    }
  }, [initialRoomCode]);

  if (!isOpen) return null;

  // Handle Room Creation
  const handleCreate = async () => {
    sound.playClick();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await createOnlineRoom(playerName.trim() || 'ホスト', maxPlayers);
      if (res) {
        setMyPlayerId(res.myPlayerId);
        setActiveRoom({
          id: res.roomId,
          roomCode: res.roomCode,
          hostId: res.myPlayerId,
          maxPlayers,
          status: 'LOBBY',
          players: [
            {
              id: res.myPlayerId,
              name: playerName.trim() || 'ホスト',
              avatarSeed: 1,
              isHost: true,
              ready: true,
            },
          ],
        });
        setTab('LOBBY');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'ルーム作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Room Join
  const handleJoin = async () => {
    sound.playClick();
    if (!inputRoomCode.trim()) {
      setErrorMessage('合言葉（6桁の番号）を入力してください。');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await joinOnlineRoom(inputRoomCode, playerName.trim() || '参加者');
      setMyPlayerId(res.myPlayerId);
      setActiveRoom(res.room);
      setTab('LOBBY');
    } catch (e: any) {
      setErrorMessage(e.message || '部屋が見つかりませんでした。');
    } finally {
      setIsLoading(false);
    }
  };

  // Host starts the game
  const handleStartBattle = async () => {
    if (!activeRoom) return;
    sound.playBattleStart();
    setIsLoading(true);
    try {
      await startOnlineGame(activeRoom.id, activeRoom.players);
      onGameStarted(activeRoom.id, myPlayerId, activeRoom);
    } catch (e: any) {
      setErrorMessage('バトル開始に失敗しました。');
      setIsLoading(false);
    }
  };

  // Copy Code
  const handleCopyCode = () => {
    if (!activeRoom) return;
    sound.playClick();
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy URL
  const handleCopyUrl = () => {
    if (!activeRoom) return;
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}?room=${activeRoom.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const isHost = activeRoom ? activeRoom.hostId === myPlayerId : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif-jp text-lg font-bold text-amber-400">
                オンライン対戦
              </h2>
              <p className="text-[11px] text-stone-400">
                離れたスマホやPCの友達と合言葉でリアルタイム対戦
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 text-stone-400 hover:text-stone-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-600/50 text-rose-300 text-xs font-serif-jp flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: Initial Choice */}
        {tab === 'CHOICE' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-stone-300 font-serif-jp leading-relaxed text-center mb-6">
              部屋を作って合言葉を友達に教えるか、<br />
              友達から教えてもらった合言葉を入力して参加してください。
            </p>

            <button
              onClick={() => {
                sound.playClick();
                setTab('CREATE');
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-serif-jp text-sm flex items-center justify-between shadow-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 fill-slate-950" />
                <div className="text-left">
                  <div className="text-base text-slate-950 font-black">ルームを作成する</div>
                  <div className="text-xs text-amber-950/80 font-normal">合言葉を発行して友達を招待</div>
                </div>
              </div>
              <span className="text-xs bg-slate-950/20 px-2.5 py-1 rounded-full text-slate-950">部屋主</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setTab('JOIN');
              }}
              className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-sky-500/40 text-stone-100 font-bold font-serif-jp text-sm flex items-center justify-between shadow-lg cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-sky-400" />
                <div className="text-left">
                  <div className="text-base text-sky-300 font-black">合言葉で参加する</div>
                  <div className="text-xs text-stone-400 font-normal">友達から聞いた6桁の番号を入力</div>
                </div>
              </div>
              <span className="text-xs bg-sky-950/60 border border-sky-500/30 px-2.5 py-1 rounded-full text-sky-300">参加</span>
            </button>
          </div>
        )}

        {/* TAB 2: Create Room */}
        {tab === 'CREATE' && (
          <div className="space-y-4 py-2 font-serif-jp">
            <div>
              <label className="text-xs text-stone-300 block mb-1.5 font-medium">
                あなたのプレイヤー名
              </label>
              <input
                type="text"
                value={playerName}
                maxLength={10}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="勇者タロウ"
                className="w-full px-4 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1.5 font-medium">
                対戦人数
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMaxPlayers(cnt);
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      maxPlayers === cnt
                        ? 'border-amber-400 bg-amber-950/50 text-amber-300 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-950 text-stone-400 hover:border-slate-700'
                    }`}
                  >
                    {cnt}人 対戦 {cnt === 2 ? '(1vs1)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTab('CHOICE');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                戻る
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleCreate}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>作成中...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>合言葉を発行して部屋を作る</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Join Room */}
        {tab === 'JOIN' && (
          <div className="space-y-4 py-2 font-serif-jp">
            <div>
              <label className="text-xs text-stone-300 block mb-1.5 font-medium">
                あなたのプレイヤー名
              </label>
              <input
                type="text"
                value={playerName}
                maxLength={10}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="魔法使いハナコ"
                className="w-full px-4 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1.5 font-medium">
                合言葉（6桁の番号）
              </label>
              <input
                type="text"
                value={inputRoomCode}
                maxLength={8}
                onChange={(e) => setInputRoomCode(e.target.value.replace(/\D/g, ''))}
                placeholder="例: 123456"
                className="w-full px-4 py-3 bg-slate-950 border-2 border-sky-500/50 rounded-xl text-center text-xl tracking-widest font-mono text-sky-300 font-bold focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTab('CHOICE');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                戻る
              </button>

              <button
                type="button"
                disabled={isLoading || !inputRoomCode.trim()}
                onClick={handleJoin}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>入室中...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>部屋に入る</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Active Room Lobby */}
        {tab === 'LOBBY' && activeRoom && (
          <div className="space-y-5 font-serif-jp">
            
            {/* Room Code Display */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-amber-400 uppercase tracking-widest block mb-1">
                対戦の合言葉 (Room Code)
              </span>
              <div className="font-mono text-3xl font-black tracking-widest text-amber-300 select-all">
                {activeRoom.roomCode}
              </div>

              {/* Action Buttons to share */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'コピー完了！' : '合言葉をコピー'}</span>
                </button>

                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-xs text-sky-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'URLコピー完了！' : '招待リンクをコピー'}</span>
                </button>
              </div>
            </div>

            {/* Players in Room */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                <span>参加者一覧</span>
                <span>
                  {activeRoom.players.length} / {activeRoom.maxPlayers}人
                </span>
              </div>

              <div className="space-y-2">
                {activeRoom.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-400/50 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.isHost && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              ホスト
                            </span>
                          )}
                          {p.id === myPlayerId && (
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded">
                              あなた
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>待機中</span>
                    </div>
                  </div>
                ))}

                {/* Waiting slots */}
                {Array.from({ length: activeRoom.maxPlayers - activeRoom.players.length }).map((_, i) => (
                  <div
                    key={`slot-${i}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-stone-600 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-stone-600 text-xs">
                        ?
                      </div>
                      <span>対戦相手の入室を待っています...</span>
                    </div>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Host / Guest Actions */}
            <div className="pt-2 space-y-2">
              {isHost ? (
                <button
                  type="button"
                  disabled={activeRoom.players.length < 2 || isLoading}
                  onClick={handleStartBattle}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>開始中...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>
                        {activeRoom.players.length >= 2
                          ? '全員揃いました！バトル開始！'
                          : 'あと1人以上の参加が必要です'}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/50 border border-amber-900/30 text-center text-xs text-amber-300/80 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>ホストがバトルを開始するのを待っています...</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveRoom(null);
                  setTab('CHOICE');
                }}
                className="w-full py-2 text-center text-xs text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
              >
                部屋を退出する
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
