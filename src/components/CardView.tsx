import React from 'react';
import { CardData } from '../types/game';
import { getCustomCardArtwork, getCardDesignMode, CardDesignMode } from '../utils/customCardImages';

interface CardViewProps {
  card?: CardData;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  isPlayable?: boolean;
  size?: 'mini' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  showPointsPreview?: boolean;
  isWinningClash?: boolean;
  badgeText?: string;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  faceDown = false,
  selected = false,
  disabled = false,
  isPlayable = false,
  size = 'md',
  onClick,
  className = '',
  showPointsPreview = true,
  isWinningClash = false,
  badgeText,
}) => {
  // Dimension tokens
  const sizeStyles = {
    mini: 'w-14 h-20 text-[9px] rounded',
    sm: 'w-24 h-36 text-xs rounded-lg',
    md: 'w-36 h-52 text-xs rounded-xl',
    lg: 'w-48 h-72 text-sm rounded-2xl',
  }[size];

  if (faceDown || !card) {
    return (
      <div
        onClick={!disabled && onClick ? onClick : undefined}
        className={`relative ${sizeStyles} select-none transition-all duration-200 border-2 border-amber-900/60 bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950 shadow-md ${
          selected ? 'ring-2 ring-amber-400 -translate-y-2 shadow-amber-900/40 shadow-lg' : ''
        } ${isPlayable ? 'cursor-pointer hover:-translate-y-1 hover:border-amber-500/80 hover:shadow-lg' : ''} ${className}`}
      >
        <div className="absolute inset-1 rounded border border-amber-500/20 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none" />
          {/* Card back filigree */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 border border-amber-500/40 rotate-45 flex items-center justify-center mb-1">
            <div className="w-7 h-7 border border-amber-500/30 rotate-45 flex items-center justify-center">
              <span className="font-cinzel text-amber-400 font-bold text-base -rotate-90">AΩ</span>
            </div>
          </div>
          <span className="font-cinzel tracking-wider text-[10px] text-amber-300/80 uppercase">Order</span>
        </div>
      </div>
    );
  }

  // Category based borders & highlights
  const getThemeStyles = () => {
    switch (card.category) {
      case 'deity':
        return {
          border: 'border-amber-400/80',
          bgGradient: 'from-slate-900 via-stone-900 to-amber-950/70',
          accent: 'text-amber-400',
          letterColor: 'text-amber-300',
          glow: 'shadow-amber-500/20',
        };
      case 'hero':
        return {
          border: 'border-sky-400/80',
          bgGradient: 'from-slate-900 via-stone-900 to-sky-950/70',
          accent: 'text-sky-400',
          letterColor: 'text-sky-300',
          glow: 'shadow-sky-500/20',
        };
      case 'demon':
        return {
          border: 'border-rose-500/80',
          bgGradient: 'from-slate-900 via-stone-900 to-rose-950/80',
          accent: 'text-rose-400',
          letterColor: 'text-rose-400',
          glow: 'shadow-rose-500/20',
        };
      case 'dragon':
        return {
          border: 'border-cyan-400/80',
          bgGradient: 'from-slate-900 via-stone-900 to-cyan-950/70',
          accent: 'text-cyan-400',
          letterColor: 'text-cyan-300',
          glow: 'shadow-cyan-500/20',
        };
      case 'myth':
        return {
          border: 'border-emerald-400/80',
          bgGradient: 'from-slate-900 via-stone-900 to-emerald-950/70',
          accent: 'text-emerald-400',
          letterColor: 'text-emerald-300',
          glow: 'shadow-emerald-500/20',
        };
      default:
        return {
          border: 'border-stone-400/60',
          bgGradient: 'from-slate-900 via-stone-900 to-stone-800/80',
          accent: 'text-amber-300',
          letterColor: 'text-stone-200',
          glow: 'shadow-stone-500/15',
        };
    }
  };

  const theme = getThemeStyles();

  const [customArt, setCustomArt] = React.useState<string | null>(() =>
    card ? getCustomCardArtwork(card.letter) : null
  );

  React.useEffect(() => {
    if (!card) return;
    setCustomArt(getCustomCardArtwork(card.letter));

    const handleArtUpdate = (e: any) => {
      if (e?.detail?.all || e?.detail?.letter === card.letter) {
        setCustomArt(getCustomCardArtwork(card.letter));
      }
    };

    window.addEventListener('ao-card-art-updated', handleArtUpdate);
    return () => window.removeEventListener('ao-card-art-updated', handleArtUpdate);
  }, [card?.letter]);

  const [designMode, setDesignMode] = React.useState<CardDesignMode>(() => getCardDesignMode());

  React.useEffect(() => {
    const handleModeUpdate = (e: any) => {
      setDesignMode(e?.detail?.mode || getCardDesignMode());
    };
    window.addEventListener('ao-card-design-mode-updated', handleModeUpdate);
    return () => window.removeEventListener('ao-card-design-mode-updated', handleModeUpdate);
  }, []);

  const [imgAttempt, setImgAttempt] = React.useState<number>(0);
  const [imgFailed, setImgFailed] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImgAttempt(0);
    setImgFailed(false);
  }, [card?.letter, card?.imageUrl, customArt]);

  const candidateSources = React.useMemo(() => {
    if (!card) return [];
    const list: string[] = [];
    if (customArt) list.push(customArt);
    if (card.imageUrl) list.push(card.imageUrl);

    const extensions = ['.jpg', '.JPG', '.png', '.PNG', '.jpeg', '.JPEG', '.webp', '.WEBP'];
    const letterVariants = [card.letter, card.letter.toLowerCase()];

    for (const ext of extensions) {
      for (const l of letterVariants) {
        list.push(`/cards/${l}${ext}`);
        list.push(`/${l}${ext}`);
      }
    }

    return Array.from(new Set(list));
  }, [customArt, card?.imageUrl, card?.letter]);

  const currentImageSrc =
    !imgFailed && imgAttempt < candidateSources.length ? candidateSources[imgAttempt] : null;

  const handleImageError = () => {
    if (imgAttempt + 1 < candidateSources.length) {
      setImgAttempt((prev) => prev + 1);
    } else {
      setImgFailed(true);
    }
  };

  // Full-Art Illustration-Only Mode (When card has an artwork image)
  if (designMode === 'art_only' && currentImageSrc) {
    return (
      <div
        onClick={!disabled && onClick ? onClick : undefined}
        className={`group relative ${sizeStyles} select-none transition-all duration-200 rounded-xl overflow-hidden shadow-xl border-2 ${
          selected
            ? 'ring-4 ring-amber-300 -translate-y-3 shadow-amber-400/40 shadow-2xl border-amber-300 z-20'
            : `${theme.border} ${theme.glow} hover:border-amber-300/80`
        } ${isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl' : ''} ${
          disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''
        } ${isWinningClash ? 'ring-4 ring-amber-400 scale-105 shadow-2xl shadow-amber-400/50 z-20' : ''} ${className}`}
      >
        {/* Full-bleed Card Illustration Only */}
        <img
          src={currentImageSrc}
          alt={card.japaneseName}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Optional Badge */}
        {badgeText && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
            {badgeText}
          </div>
        )}

        {/* Subtle Hover / Tap Tooltip for Effect & Details */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col justify-end z-20">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="font-cinzel text-sm">{card.letter} : {card.japaneseName}</span>
            <span className="font-mono text-amber-400">{card.points}pt</span>
          </div>
          <p className="text-[10px] text-stone-200 leading-tight line-clamp-2 mt-0.5 font-serif-jp">
            {card.shortEffect}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`group relative ${sizeStyles} select-none transition-all duration-200 bg-gradient-to-b ${theme.bgGradient} border-2 ${theme.border} ${theme.glow} shadow-md flex flex-col justify-between p-2 overflow-hidden ${
        selected ? 'ring-2 ring-amber-300 -translate-y-3 shadow-amber-400/30 shadow-xl' : ''
      } ${isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl' : ''} ${
        disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''
      } ${isWinningClash ? 'ring-4 ring-amber-400 scale-105 shadow-2xl shadow-amber-400/50 z-20' : ''} ${className}`}
    >
      {/* Background card texture watermark */}
      <div className="absolute -right-4 -bottom-6 font-cinzel text-7xl font-black text-white/[0.03] select-none pointer-events-none">
        {card.letter}
      </div>

      {/* Optional Badge */}
      {badgeText && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
          {badgeText}
        </div>
      )}

      {/* Top Header: Letter & Score */}
      <div className="flex items-start justify-between z-10">
        <div className="flex items-baseline gap-1">
          <span className={`font-cinzel text-2xl sm:text-3xl font-black leading-none ${theme.letterColor}`}>
            {card.letter}
          </span>
          {size !== 'mini' && (
            <span className="text-[10px] text-stone-400 hidden sm:inline uppercase">
              {card.category}
            </span>
          )}
        </div>

        {showPointsPreview && (
          <div className="flex flex-col items-end">
            <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 tabular-nums">
              {card.points}pt
            </span>
          </div>
        )}
      </div>

      {/* Center Body: Names & Artwork/Symbol */}
      <div className="my-auto z-10 flex flex-col items-center text-center px-0.5 w-full">
        <h4 className="font-serif-jp text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-full">
          {card.japaneseName}
        </h4>
        <span className="text-[9px] sm:text-[10px] text-stone-400 font-cinzel tracking-wider truncate max-w-full">
          {card.name}
        </span>

        {/* Optional Artwork Image Frame */}
        {size !== 'mini' && currentImageSrc && (
          <div
            className={`mt-1 w-full overflow-hidden rounded-md border border-white/20 shadow-inner bg-slate-950 flex items-center justify-center shrink-0 ${
              size === 'lg' ? 'h-24 sm:h-28' : size === 'md' ? 'h-14 sm:h-16' : 'h-8'
            }`}
          >
            <img
              src={currentImageSrc}
              alt={card.japaneseName}
              onError={handleImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {size !== 'mini' && (
          <div className="mt-1 w-full bg-slate-950/70 rounded p-1 sm:p-1.5 border border-white/10 text-left">
            <p className="text-[9px] sm:text-[10px] text-stone-200 leading-tight line-clamp-2 sm:line-clamp-3">
              {card.shortEffect}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer: Reversed Letter & Category */}
      <div className="flex items-end justify-between z-10 text-[9px] text-stone-400 pt-0.5">
        <span className="hidden sm:inline-block font-mono text-[9px] text-stone-400">
          Rank {card.letter}
        </span>
        <span className={`font-cinzel font-bold text-sm ${theme.letterColor}`}>
          {card.letter}
        </span>
      </div>
    </div>
  );
};
