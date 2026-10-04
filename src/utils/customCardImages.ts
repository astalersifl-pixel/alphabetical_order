import { Letter } from '../types/game';

const STORAGE_PREFIX = 'ao_card_art_';
const UPDATE_EVENT_NAME = 'ao-card-art-updated';
const DESIGN_MODE_KEY = 'ao_card_design_mode';

export type CardDesignMode = 'art_only' | 'classic';

export const ALL_LETTERS_LIST: Letter[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
];

/**
 * Get current card design mode ('art_only' = full art illustration only, 'classic' = with text frames)
 * Defaults to 'art_only'.
 */
export function getCardDesignMode(): CardDesignMode {
  try {
    const val = localStorage.getItem(DESIGN_MODE_KEY);
    if (val === 'classic') return 'classic';
    return 'art_only';
  } catch {
    return 'art_only';
  }
}

/**
 * Set card design mode and dispatch event for immediate reactivity.
 */
export function setCardDesignMode(mode: CardDesignMode): void {
  try {
    localStorage.setItem(DESIGN_MODE_KEY, mode);
    window.dispatchEvent(new CustomEvent('ao-card-design-mode-updated', { detail: { mode } }));
  } catch (err) {
    console.warn('Failed to set card design mode:', err);
  }
}

/**
 * Get custom card artwork data URL or URL for a specific letter.
 */
export function getCustomCardArtwork(letter: Letter): string | null {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${letter}`);
  } catch {
    return null;
  }
}

/**
 * Save custom card artwork data URL for a specific letter.
 */
export function setCustomCardArtwork(letter: Letter, dataUrl: string): boolean {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${letter}`, dataUrl);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { letter, dataUrl } }));
    return true;
  } catch (err) {
    console.warn(`Failed to save card artwork for ${letter}:`, err);
    return false;
  }
}

/**
 * Remove custom card artwork for a specific letter.
 */
export function removeCustomCardArtwork(letter: Letter): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${letter}`);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { letter, dataUrl: null } }));
  } catch (err) {
    console.warn(`Failed to remove card artwork for ${letter}:`, err);
  }
}

/**
 * Clear all custom card artworks.
 */
export function clearAllCustomCardArtworks(): void {
  try {
    ALL_LETTERS_LIST.forEach((l) => localStorage.removeItem(`${STORAGE_PREFIX}${l}`));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { all: true } }));
  } catch (err) {
    console.warn('Failed to clear card artworks:', err);
  }
}

/**
 * Dictionary mapping Japanese / English keywords to card letters
 */
const KEYWORD_TO_LETTER_MAP: Record<string, Letter> = {
  // Japanese keywords
  '太陽神': 'A',
  '天照': 'A',
  'アマテラス': 'A',
  '勇者': 'B',
  'ゆうしゃ': 'B',
  'クリスタルドラゴン': 'C',
  'ドラゴン': 'C',
  '魔王': 'D',
  'まおう': 'D',
  'デビル': 'D',
  '皇帝': 'E',
  'こうてい': 'E',
  '火の鳥': 'F',
  'ひのとり': 'F',
  'フェニックス': 'F',
  '不死鳥': 'F',
  'ガーゴイル': 'G',
  'ヒドラ': 'H',
  'ハイドラ': 'H',
  'アイアンゴーレム': 'I',
  'ゴーレム': 'I',
  '死神': 'J',
  'しにがみ': 'J',
  'ジョーカー': 'J',
  '麒麟': 'K',
  'きりん': 'K',
  'キリン': 'K',
  'リヴァイアサン': 'L',
  'レヴィアタン': 'L',
  'ミノタウロス': 'M',
  'ニンフ': 'N',
  '妖精': 'N',
  'オーガ': 'O',
  '鬼': 'O',
  '王子': 'P',
  'プリンス': 'P',
  '女王': 'Q',
  'クイーン': 'Q',
  '革命家': 'R',
  '革命': 'R',
  '兵士': 'S',
  'ソルジャー': 'S',
  'トロール': 'T',
  'ユニコーン': 'U',
  '吸血鬼': 'V',
  'ヴァンパイア': 'V',
  'バンパイア': 'V',
  '狼男': 'W',
  '人狼': 'W',
  'ウェアウルフ': 'W',
  '異世界人': 'X',
  '異世界': 'X',
  '転生者': 'X',
  '青年': 'Y',
  '若者': 'Y',
  'ゼロ': 'Z',

  // English keywords
  'amateras': 'A',
  'sun': 'A',
  'brave': 'B',
  'hero': 'B',
  'crystal': 'C',
  'devil': 'D',
  'demon': 'D',
  'emperor': 'E',
  'phoenix': 'F',
  'fire': 'F',
  'gargoyle': 'G',
  'hydra': 'H',
  'golem': 'I',
  'iron': 'I',
  'joker': 'J',
  'death': 'J',
  'kirin': 'K',
  'leviathan': 'L',
  'minotaur': 'M',
  'nymph': 'N',
  'ogre': 'O',
  'prince': 'P',
  'queen': 'Q',
  'revolutionary': 'R',
  'revolution': 'R',
  'soldier': 'S',
  'troll': 'T',
  'unicorn': 'U',
  'vampire': 'V',
  'werewolf': 'W',
  'wolf': 'W',
  'xenos': 'X',
  'youth': 'Y',
  'zero': 'Z',
};

/**
 * Super-smart letter detection from any filename
 * Handles:
 * - "A.jpg", "A.JPG", "a.png", "A.jpeg"
 * - "01.jpg", "1.png" (1 to 26 numbered)
 * - "Ａ.jpg" (Full-width Japanese letters)
 * - "A_太陽神.jpg", "太陽神.jpg", "B_勇者.png", "Brave.jpg"
 * - "card_a.jpg", "A (1).jpg", "[A]card.png"
 */
export function detectLetterFromFilename(filename: string): Letter | null {
  // Normalize unicode (converts full-width Ａ-Ｚ to half-width A-Z)
  const normalized = filename.normalize('NFKC').trim();
  const lower = normalized.toLowerCase();
  
  // Remove file extension
  const nameWithoutExt = lower.replace(/\.(jpe?g|png|webp|gif|svg|bmp|tiff)$/i, '');

  // 1. Exact 1-letter check (e.g. "a", "A")
  if (/^[a-z]$/i.test(nameWithoutExt)) {
    return nameWithoutExt.toUpperCase() as Letter;
  }

  // 2. Exact or padded number check (e.g. "01", "1", "26") -> maps 1..26 to A..Z
  const numMatch = nameWithoutExt.match(/^0*([1-9]|1[0-9]|2[0-6])$/);
  if (numMatch) {
    const index = parseInt(numMatch[1], 10) - 1;
    if (index >= 0 && index < ALL_LETTERS_LIST.length) {
      return ALL_LETTERS_LIST[index];
    }
  }

  // 3. Isolated letter with separators (e.g. "A_xxx", "card-A", "01_A", "[A]", "A (1)")
  const isolatedLetterMatch = nameWithoutExt.match(/(?:^|[^a-z0-9])([a-z])(?:[^a-z0-9]|$)/i);
  if (isolatedLetterMatch) {
    const candidate = isolatedLetterMatch[1].toUpperCase() as Letter;
    if (candidate >= 'A' && candidate <= 'Z') {
      return candidate;
    }
  }

  // 4. Keyword check from card names (Japanese & English)
  for (const [keyword, letter] of Object.entries(KEYWORD_TO_LETTER_MAP)) {
    if (nameWithoutExt.includes(keyword)) {
      return letter;
    }
  }

  return null;
}

/**
 * Optimizes, compresses, and resizes an image file to fit perfectly in browser storage.
 * A 4MB camera photo becomes ~70KB with razor-sharp quality, preventing QuotaExceededError!
 */
export async function optimizeAndCompressImage(file: File, maxDim = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ファイル読み込みに失敗しました'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('画像の解析に失敗しました'));
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original data URL if canvas context unavailable
            resolve(reader.result as string);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // Fallback to original
          resolve(reader.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Process and save multiple uploaded files at once.
 * Compresses each file before saving so all 26 cards easily fit in browser storage!
 */
export async function importCustomCardImageFiles(files: FileList | File[]): Promise<{
  matchedLetters: Letter[];
  unmatchedFiles: string[];
  failedToSave: Letter[];
}> {
  const fileArray = Array.from(files);
  const matchedLetters: Letter[] = [];
  const unmatchedFiles: string[] = [];
  const failedToSave: Letter[] = [];

  for (const file of fileArray) {
    const letter = detectLetterFromFilename(file.name);
    if (!letter) {
      unmatchedFiles.push(file.name);
      continue;
    }

    try {
      // Compress and optimize image to ~70KB
      const compressedDataUrl = await optimizeAndCompressImage(file);
      const success = setCustomCardArtwork(letter, compressedDataUrl);
      if (success) {
        matchedLetters.push(letter);
      } else {
        // If still failed, try extreme compression ~30KB
        const extremeCompressed = await optimizeAndCompressImage(file, 500, 0.7);
        if (setCustomCardArtwork(letter, extremeCompressed)) {
          matchedLetters.push(letter);
        } else {
          failedToSave.push(letter);
        }
      }
    } catch {
      failedToSave.push(letter);
    }
  }

  return { matchedLetters, unmatchedFiles, failedToSave };
}
