import { Letter } from '../types/game';

const STORAGE_PREFIX = 'ao_card_art_';
const UPDATE_EVENT_NAME = 'ao-card-art-updated';
const DESIGN_MODE_KEY = 'ao_card_design_mode';

export type CardDesignMode = 'art_only' | 'classic';

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
export function setCustomCardArtwork(letter: Letter, dataUrl: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${letter}`, dataUrl);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { letter, dataUrl } }));
  } catch (err) {
    console.warn(`Failed to save card artwork for ${letter}:`, err);
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
    const letters: Letter[] = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
      'U', 'V', 'W', 'X', 'Y', 'Z'
    ];
    letters.forEach((l) => localStorage.removeItem(`${STORAGE_PREFIX}${l}`));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: { all: true } }));
  } catch (err) {
    console.warn('Failed to clear card artworks:', err);
  }
}

/**
 * Parse letter from filename (e.g. "A.jpg", "card-b.png", "Z.webp", "brave.jpg", "勇者.png")
 */
export function detectLetterFromFilename(filename: string): Letter | null {
  const cleanName = filename.trim().toLowerCase();
  
  // Exact 1-letter match (e.g. "a.jpg", "b.png")
  const singleMatch = cleanName.match(/^([a-z])\.(?:jpe?g|png|webp|gif|svg)$/i);
  if (singleMatch) {
    return singleMatch[1].toUpperCase() as Letter;
  }

  // Prefix match (e.g. "a_card.jpg", "card_a.png", "letter-a.jpg")
  const prefixMatch = cleanName.match(/(?:^|[^a-z])([a-z])(?:\.(?:jpe?g|png|webp|gif|svg)$|[^a-z])/i);
  if (prefixMatch) {
    const candidate = prefixMatch[1].toUpperCase() as Letter;
    if (candidate >= 'A' && candidate <= 'Z') {
      return candidate;
    }
  }

  return null;
}

/**
 * Process and save multiple uploaded files at once.
 */
export async function importCustomCardImageFiles(files: FileList | File[]): Promise<{
  matchedLetters: Letter[];
  unmatchedFiles: string[];
}> {
  const fileArray = Array.from(files);
  const matchedLetters: Letter[] = [];
  const unmatchedFiles: string[] = [];

  for (const file of fileArray) {
    const letter = detectLetterFromFilename(file.name);
    if (!letter) {
      unmatchedFiles.push(file.name);
      continue;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCustomCardArtwork(letter, dataUrl);
      matchedLetters.push(letter);
    } catch {
      unmatchedFiles.push(file.name);
    }
  }

  return { matchedLetters, unmatchedFiles };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
