import React, { useState, useEffect, useRef } from 'react';
import { Letter } from '../types/game';
import { ALL_LETTERS, CARD_DATABASE } from '../data/cards';
import {
  getCustomCardArtwork,
  setCustomCardArtwork,
  removeCustomCardArtwork,
  clearAllCustomCardArtworks,
  importCustomCardImageFiles,
  getCardDesignMode,
  setCardDesignMode,
  CardDesignMode,
} from '../utils/customCardImages';
import { sound } from '../utils/audio';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface CustomImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomImageModal: React.FC<CustomImageModalProps> = ({ isOpen, onClose }) => {
  const [loadedImages, setLoadedImages] = useState<Record<Letter, string | null>>({} as any);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [selectedLetter, setSelectedLetter] = useState<Letter>('A');
  const [designMode, setDesignModeState] = useState<CardDesignMode>(() => getCardDesignMode());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  // Refresh current images from storage
  const refreshImages = () => {
    const map: Record<Letter, string | null> = {} as any;
    ALL_LETTERS.forEach((l) => {
      map[l] = getCustomCardArtwork(l);
    });
    setLoadedImages(map);
    setDesignModeState(getCardDesignMode());
  };

  useEffect(() => {
    if (isOpen) {
      refreshImages();
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const countLoaded = ALL_LETTERS.filter((l) => !!loadedImages[l]).length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    sound.playCardFlip();
    setStatusMessage('画像を読み込み中...');
    setStatusType('info');

    const result = await importCustomCardImageFiles(files);
    refreshImages();

    if (result.matchedLetters.length > 0) {
      sound.playClick();
      setStatusMessage(
        `🎉 ${result.matchedLetters.length}枚のカード画像（${result.matchedLetters.join(
          ', '
        )}）を登録・反映しました！`
      );
      setStatusType('success');
    } else {
      setStatusMessage(
        '⚠️ 画像のファイル名からカード（A〜Z）を特定できませんでした。「A.jpg」のような名前にしてください。'
      );
      setStatusType('error');
    }
  };

  const handleSingleCardUpload = async (letter: Letter, file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomCardArtwork(letter, reader.result as string);
        sound.playClick();
        refreshImages();
        setStatusMessage(`【${letter}: ${CARD_DATABASE[letter].japaneseName}】の画像を設定しました！`);
        setStatusType('success');
      };
      reader.readAsDataURL(file);
    } catch {
      setStatusMessage('画像の読み込みに失敗しました。');
      setStatusType('error');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('登録されているすべての自作カード画像を解除しますか？')) {
      clearAllCustomCardArtworks();
      sound.playClick();
      refreshImages();
      setStatusMessage('すべての自作画像を解除しました。');
      setStatusType('info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-serif-jp">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-900/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>自作カードイラストの一括設定</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {countLoaded} / 26 枚 登録済
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                お持ちの「A.jpg〜Z.jpg」を選択するだけで、今すぐこの画面に全イラストが反映されます！
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Status Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs sm:text-sm animate-fade-in ${
                statusType === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : statusType === 'error'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              {statusType === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : statusType === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span className="leading-tight">{statusMessage}</span>
            </div>
          )}

          {/* Card Design Style Selector */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-300">
                  カードのデザイン表示スタイル
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                用意したイラストをカード全面（イラストのみ）で表示するか、通常枠で表示するか選べます
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-white/10 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCardDesignMode('art_only');
                  setDesignModeState('art_only');
                  setStatusMessage('カードデザインを「イラストのみ（全面表示）」に設定しました！');
                  setStatusType('success');
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  designMode === 'art_only'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>🖼️ イラストのみ（全面表示）</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCardDesignMode('classic');
                  setDesignModeState('classic');
                  setStatusMessage('カードデザインを「通常（テキスト枠あり）」に設定しました！');
                  setStatusType('info');
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  designMode === 'classic'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>📝 通常（テキスト枠あり）</span>
              </button>
            </div>
          </div>

          {/* Big Batch Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
              dragOver
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : 'border-amber-500/40 bg-slate-950/50 hover:border-amber-400/80 hover:bg-amber-950/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-amber-200">
                ここをクリックして「A.jpg〜Z.jpg」を選択
              </p>
              <p className="text-xs text-stone-400 mt-1">
                または、ファイルをここにまとめてドラッグ＆ドロップ！
              </p>
            </div>
            <span className="text-[11px] text-amber-400/70 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
              ※ファイル名（A.jpg, B.png 等）から自動で各カードに振り分けられます
            </span>
          </div>

          {/* Letter Grid Overview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                <span>カード別 画像登録状況 (A〜Z)</span>
                <span className="text-xs text-stone-400">（カードを押して個別に変更も可能）</span>
              </h3>

              {countLoaded > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>すべて解除</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
              {ALL_LETTERS.map((letter) => {
                const card = CARD_DATABASE[letter];
                const art = loadedImages[letter];
                const isSelected = selectedLetter === letter;

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedLetter(letter);
                    }}
                    className={`relative p-1.5 rounded-xl border flex flex-col items-center justify-between aspect-[3/4] text-center transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/40 scale-105 z-10'
                        : art
                        ? 'border-emerald-500/40 bg-slate-950/70 hover:border-emerald-400'
                        : 'border-white/10 bg-slate-950/40 hover:border-white/20 opacity-70'
                    }`}
                  >
                    {/* Top letter */}
                    <div className="flex items-center justify-between w-full text-[10px] px-0.5">
                      <span className="font-cinzel font-black text-amber-300">{letter}</span>
                      {art ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span className="text-stone-600 text-[9px]">-</span>
                      )}
                    </div>

                    {/* Preview Image / Placeholder */}
                    <div className="w-full flex-1 my-1 rounded overflow-hidden bg-slate-950/80 border border-white/10 flex items-center justify-center">
                      {art ? (
                        <img
                          src={art}
                          alt={card.japaneseName}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <span className="text-[10px] text-stone-600 font-cinzel">No img</span>
                      )}
                    </div>

                    {/* Japanese Name */}
                    <span className="text-[9px] text-stone-300 truncate w-full">
                      {card.japaneseName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Card Single Editor */}
          {selectedLetter && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-18 rounded-lg overflow-hidden border border-amber-500/40 bg-slate-900 shrink-0 flex items-center justify-center">
                  {loadedImages[selectedLetter] ? (
                    <img
                      src={loadedImages[selectedLetter]!}
                      alt={CARD_DATABASE[selectedLetter].japaneseName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-stone-500 font-cinzel">{selectedLetter}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    【{selectedLetter}】{CARD_DATABASE[selectedLetter].name}（
                    {CARD_DATABASE[selectedLetter].japaneseName}）
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    状態:{' '}
                    {loadedImages[selectedLetter] ? (
                      <span className="text-emerald-400 font-medium">自作画像が設定されています</span>
                    ) : (
                      <span className="text-stone-500">標準デザイン（未登録）</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={singleFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSingleCardUpload(selectedLetter, file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => singleFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>このカードの画像を選択</span>
                </button>

                {loadedImages[selectedLetter] && (
                  <button
                    type="button"
                    onClick={() => {
                      removeCustomCardArtwork(selectedLetter);
                      sound.playClick();
                      refreshImages();
                      setStatusMessage(`【${selectedLetter}】の画像を解除しました。`);
                      setStatusType('info');
                    }}
                    className="p-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer transition-colors"
                    title="このカードの画像を解除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* GitHub / Render explanation */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-stone-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ヒント：Render（本番サイト）でも全員に見せたい場合</span>
            </div>
            <p className="leading-relaxed text-stone-400">
              この画面で画像を登録すると、今お使いのブラウザに即座に保存・反映されます（次回以降も残ります）。
              さらにRenderの本番環境でも全員に表示させたい場合は、今回の最新コードをGitHubにプッシュ（またはZIPアップロード）していただければ自動連携されます！
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-amber-900/40 bg-slate-950/80 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 cursor-pointer transition-all"
          >
            完了して対戦へ戻る
          </button>
        </div>
      </div>
    </div>
  );
};
