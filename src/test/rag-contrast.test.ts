import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The dashboard colours its percentages against the baseline standard, so the
 * figures have to stay readable on every background a row can have: the plain
 * card, the benchmark row's tint and the hover highlight. This test reads the
 * tokens straight from src/styles.css, so a colour change that drops a pair
 * below WCAG AA fails the build rather than shipping quietly.
 *
 * The figures are set in large bold type (see the size guard below), so the AA
 * bar that applies to them is the large-text one: 3:1. Anything smaller in the
 * dashboard still has to clear 4.5:1.
 */

const CSS = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");

type Rgb = [number, number, number];

/**
 * Read the light `:root` block only — the stylesheet also carries a `.dark`
 * block and a comment that mentions `:root`, and the dashboard is light-only.
 */
function parseTheme(): Record<string, string> {
  const start = CSS.search(/^:root\s*\{/m);
  const block = CSS.slice(start, CSS.indexOf("\n}", start));
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/(?<name>--[\w-]+)\s*:\s*(?<value>[^;]+);/g)) {
    const { name, value } = m.groups ?? {};
    if (name && value) out[name] = value.trim();
  }
  return out;
}

const TOKENS = parseTheme();

/** Read a token, failing loudly if the stylesheet no longer defines it. */
function tok(name: string): string {
  const value = TOKENS[name];
  if (!value) throw new Error(`Missing token: ${name}`);
  return value;
}

function oklchToRgb(value: string): Rgb {
  const m = value
    .replace(/\/.*/, "")
    .match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) throw new Error(`Unsupported colour: ${value}`);
  const [L, C, H] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const [l, mm, s] = [l_ ** 3, m_ ** 3, s_ ** 3];
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  return lin.map((c) => {
    const v = Math.min(1, Math.max(0, c));
    return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  }) as Rgb;
}

function luminance(rgb: Rgb) {
  const [r = 0, g = 0, b = 0] = rgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbContrast(a: Rgb, b: Rgb) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = [Math.max(la, lb), Math.min(la, lb)];
  return (hi + 0.05) / (lo + 0.05);
}

/** Accept a raw colour, a bare token name, or a `var(--token)` reference. */
function resolve(value: string): string {
  const name = value.replace(/^var\((.+)\)$/, "$1").trim();
  return name.startsWith("--") ? tok(name) : value;
}

function contrast(a: string, b: string) {
  return rgbContrast(oklchToRgb(resolve(a)), oklchToRgb(resolve(b)));
}

/**
 * Alpha-composite a colour over a surface the way a translucent background
 * class renders, e.g. `bg-primary/10` over the card.
 */
function over(fg: string, bg: Rgb, alpha: number): Rgb {
  const [fr, fgr, fb] = oklchToRgb(fg);
  const [br, bgr, bb] = bg;
  return [
    alpha * fr + (1 - alpha) * br,
    alpha * fgr + (1 - alpha) * bgr,
    alpha * fb + (1 - alpha) * bb,
  ];
}

/** WCAG AA for large text (18.66px bold or 24px normal) — the bar the figures clear. */
const AA = 3.0;
const CARD = oklchToRgb(tok("--card"));

/** RAG inks on the card they are drawn on: the table figures. */
const RAG_PAIRS: [string, string, string][] = [
  ["figures", "var(--rag-green-ink)", "var(--card)"],
  ["figures", "var(--rag-orange-ink)", "var(--card)"],
  ["figures", "var(--rag-red-ink)", "var(--card)"],
];

/** Backgrounds a table row can show: the hover highlight, and the benchmark row's tint. */
const HOVER = over(tok("--primary"), CARD, 0.1);
const BENCHMARK_ROW = over(tok("--secondary"), CARD, 0.4);

const INKS = ["--rag-green-ink", "--rag-orange-ink", "--rag-red-ink"];

describe("RAG colour contrast", () => {
  for (const [, ink, surface] of RAG_PAIRS) {
    it(`${ink} on ${surface} meets AA`, () => {
      expect(contrast(ink, surface)).toBeGreaterThanOrEqual(AA);
    });
  }

  it("keeps the RAG fills distinct from their inks", () => {
    for (const name of ["--rag-green", "--rag-orange", "--rag-red"]) {
      expect(TOKENS[name], name).toBeTruthy();
    }
  });
});

describe("RAG figures on every row background", () => {
  for (const name of INKS) {
    it(`${name} meets AA on the hovered row`, () => {
      expect(rgbContrast(oklchToRgb(tok(name)), HOVER)).toBeGreaterThanOrEqual(AA);
    });
    it(`${name} meets AA on the benchmark row`, () => {
      expect(rgbContrast(oklchToRgb(tok(name)), BENCHMARK_ROW)).toBeGreaterThanOrEqual(AA);
    });
  }

  it("keeps the hover highlight darker than both the card and the benchmark row", () => {
    expect(luminance(HOVER)).toBeLessThan(luminance(CARD));
    expect(luminance(HOVER)).toBeLessThan(luminance(BENCHMARK_ROW));
  });
});

/**
 * The bright inks are only legal while the figures stay in large bold type —
 * WCAG's 3:1 bar applies from 18.66px bold. This guard reads the component
 * source, so shrinking the figures without darkening the inks fails the build.
 */
describe("figures stay large enough for the 3:1 bar", () => {
  const TSX = readFileSync(
    join(process.cwd(), "src/components/dashboard/GlanceBreakdown.tsx"),
    "utf8",
  );

  /** WCAG large text: 18.66px bold (14pt) or 24px normal. */
  const LARGE_BOLD_PX = 18.66;

  function figureClasses(pattern: RegExp, what: string): string {
    const m = TSX.match(pattern);
    if (!m) throw new Error(`Could not find the ${what} figure markup`);
    return m[1]!;
  }

  for (const [what, pattern] of [
    [
      "table",
      /function CellValue[\s\S]*?className=\{cn\("([^"]+)", valueClass/,
    ],
    [
      "mobile card",
      /<p className=\{cn\("([^"]+)", valueClass/,
    ],
  ] as [string, RegExp][]) {
    it(`the ${what} figure is bold and at least ${LARGE_BOLD_PX}px`, () => {
      const cls = figureClasses(pattern, what);
      expect(cls, `${what}: bold`).toMatch(/font-bold/);
      const px = cls.match(/text-\[(\d+(?:\.\d+)?)px\]|text-(xs|sm|base|lg|xl|2xl)/);
      expect(px, `${what}: has a font size`).toBeTruthy();
      const rem: Record<string, number> = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, "2xl": 24 };
      const size = px![1] !== undefined ? Number(px![1]) : rem[px![2] ?? ""] ?? 0;
      expect(size, `${what}: font size in px`).toBeGreaterThanOrEqual(LARGE_BOLD_PX);
    });
  }
});
