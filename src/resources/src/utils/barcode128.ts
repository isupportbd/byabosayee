/**
 * Code 128-B Barcode Generator (Pure TypeScript / Zero Dependencies)
 * Generates standards-compliant, 100% scannable 1D Code-128 barcodes as SVG strings.
 */

const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 = STOP)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export interface BarcodeSvgOptions {
  height?: number;
  moduleWidth?: number;
  quietZone?: number;
  color?: string;
  showText?: boolean;
  fontSize?: number;
  textMargin?: number;
}

/**
 * Generate a scannable Code 128 SVG string.
 */
export function generateCode128Svg(text: string, options: BarcodeSvgOptions = {}): string {
  const cleanText = String(text || "").trim();
  if (!cleanText) return "";

  const height = options.height || 40;
  const moduleWidth = options.moduleWidth || 1.5;
  const quietZone = options.quietZone !== undefined ? options.quietZone : 10;
  const color = options.color || "#000000";
  const showText = options.showText ?? false;
  const fontSize = options.fontSize || 11;
  const textMargin = options.textMargin !== undefined ? options.textMargin : 1;

  // Calculate symbol sequence and checksum
  const symbols: number[] = [START_CODE_B];
  let checkSum = START_CODE_B;

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    // Code 128-B covers ASCII 32 to 126
    const symbolVal = charCode >= 32 && charCode <= 126 ? charCode - 32 : 0;
    symbols.push(symbolVal);
    checkSum += symbolVal * (i + 1);
  }

  symbols.push(checkSum % 103);
  symbols.push(STOP_CODE);

  // Measure total modules
  let totalModules = 0;
  for (const s of symbols) {
    const pattern = CODE128_PATTERNS[s] || "212222";
    for (let j = 0; j < pattern.length; j++) {
      totalModules += parseInt(pattern[j], 10);
    }
  }

  const barcodeWidth = totalModules * moduleWidth;
  const totalWidth = barcodeWidth + quietZone * 2;
  const rects: string[] = [];
  let currentX = quietZone;

  for (const s of symbols) {
    const pattern = CODE128_PATTERNS[s] || "212222";
    for (let j = 0; j < pattern.length; j++) {
      const w = parseInt(pattern[j], 10) * moduleWidth;
      // Even index = bar (black), Odd index = space (white)
      if (j % 2 === 0) {
        rects.push(`<rect x="${currentX.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${height}" fill="${color}" />`);
      }
      currentX += w;
    }
  }

  let textElement = "";
  let totalHeight = height;

  if (showText) {
    const textY = height + fontSize + textMargin;
    totalHeight = height + fontSize + textMargin + 2;
    textElement = `<text x="${quietZone.toFixed(1)}" y="${textY.toFixed(1)}" font-family="'Courier New', Courier, 'Lucida Console', monospace" font-size="${fontSize}px" font-weight="700" fill="${color}" textLength="${barcodeWidth.toFixed(1)}" lengthAdjust="spacing" text-anchor="start">${cleanText}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth.toFixed(1)} ${totalHeight.toFixed(1)}" width="100%" height="auto" style="display:block; max-width:${totalWidth.toFixed(1)}px; margin: 0 auto;">
    <rect x="0" y="0" width="${totalWidth.toFixed(1)}" height="${totalHeight.toFixed(1)}" fill="#ffffff" />
    ${rects.join("")}
    ${textElement}
  </svg>`;
}
