import fs from "node:fs";
import path from "node:path";

/**
 * Server-only asset resolution.
 *
 * Returns the public path if the file actually exists in `public/`, otherwise
 * `undefined` so the caller renders a placeholder. This runs at build time for
 * static pages, which means images can be added by dropping files into
 * `public/images/` — no code change, and no wave of 404s for slots that are
 * still empty.
 *
 * Import this only from Server Components.
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PROJECTS_DIR = path.join(PUBLIC_DIR, "projects");

/** Extensions tried in order — modern formats win when both are present. */
const EXTENSIONS = [".avif", ".webp", ".jpg", ".jpeg", ".png"];

function exists(publicPath: string): boolean {
  // Reject traversal outright; every caller passes a literal, but this keeps
  // the helper safe if it is ever wired to dynamic input.
  const resolved = path.resolve(PUBLIC_DIR, "." + publicPath);
  if (!resolved.startsWith(PUBLIC_DIR)) return false;
  try {
    return fs.statSync(resolved).isFile();
  } catch {
    return false;
  }
}

/**
 * Resolves `/images/foo.jpg`, transparently preferring `/images/foo.avif` or
 * `.webp` if you exported one of those instead.
 */
export function publicAsset(publicPath: string): string | undefined {
  if (exists(publicPath)) return publicPath;

  const parsed = path.posix.parse(publicPath);
  for (const ext of EXTENSIONS) {
    const candidate = path.posix.format({ dir: parsed.dir, name: parsed.name, ext });
    if (candidate !== publicPath && exists(candidate)) return candidate;
  }
  return undefined;
}

/* ------------------------------------------------ drop-in project folders */

/** A real screenshot plus the aspect ratio to reserve for it. */
export type ProjectShot = { src: string; ratio: string };

/** A brand lockup, sized so `next/image` can reserve its exact footprint. */
export type ProjectLogo = { src: string; width: number; height: number };

/** Gallery screens are raster only; a lockup may also be vector. */
const SHOT_FILE = /\.(avif|webp|jpe?g|png)$/i;
const LOGO_FILE = /\.(avif|webp|jpe?g|png|svg)$/i;
/** Any filename carrying "logo" is the lockup, never a gallery screen. */
const isLogoName = (name: string) => /logo/i.test(path.parse(name).name);
const SAFE_SLUG = /^[a-z0-9-]+$/;
/** Used when the intrinsic size can't be read (AVIF headers aren't parsed). */
const FALLBACK_RATIO = "16 / 9";

/** `2.png` before `10.png` — plain lexical sort gets this wrong. */
const numericOrder = new Intl.Collator("en", { numeric: true }).compare;

/**
 * Intrinsic size of a PNG, JPEG or WebP, read straight from the header. Lets a
 * gallery reserve each screenshot's true ratio instead of cropping it into a
 * fixed frame.
 */
function imageSize(absPath: string): { width: number; height: number } | undefined {
  let fd: number | undefined;
  try {
    fd = fs.openSync(absPath, "r");
    const buf = Buffer.alloc(65536);
    const read = fs.readSync(fd, buf, 0, buf.length, 0);

    // PNG — IHDR sits at a fixed offset right after the 8-byte signature.
    if (read > 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    // JPEG — walk the marker segments until a start-of-frame carries the size.
    if (read > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      for (let i = 2; i + 9 < read; ) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        const isFrame =
          marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isFrame) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }

    // WebP — a RIFF container whose first chunk carries the size, in one of
    // three layouts: extended (the one exporters emit for anything with
    // transparency), lossy and lossless.
    if (
      read > 30 &&
      buf.toString("latin1", 0, 4) === "RIFF" &&
      buf.toString("latin1", 8, 12) === "WEBP"
    ) {
      const chunk = buf.toString("latin1", 12, 16);
      if (chunk === "VP8X") {
        // 24-bit canvas dimensions, stored minus one.
        return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
      }
      if (chunk === "VP8 " && buf[23] === 0x9d && buf[24] === 0x01 && buf[25] === 0x2a) {
        return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      }
      if (chunk === "VP8L" && buf[20] === 0x2f) {
        // 14 bits each, packed little-endian and stored minus one.
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
      }
    }
  } catch {
    // Unreadable or a format we don't parse — caller falls back to a set ratio.
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
  return undefined;
}

/**
 * Declared size of an SVG, from its `width`/`height` or failing that its
 * `viewBox`. Only the ratio matters downstream, so either is fine.
 */
function svgSize(absPath: string): { width: number; height: number } | undefined {
  let tag: string | undefined;
  try {
    tag = fs.readFileSync(absPath, "utf8").slice(0, 4096).match(/<svg\b[^>]*>/i)?.[0];
  } catch {
    return undefined;
  }
  if (!tag) return undefined;

  // Reject `100%` and friends by requiring the quote (or `px`) right after.
  const attr = (name: string) =>
    positive(tag.match(new RegExp(`\\b${name}="([\\d.]+)(px)?"`, "i"))?.[1]);

  const width = attr("width");
  const height = attr("height");
  if (width && height) return { width, height };

  const box = tag.match(/\bviewBox="([^"]*)"/i)?.[1]?.trim().split(/[\s,]+/);
  if (box?.length === 4) {
    const boxWidth = positive(box[2]);
    const boxHeight = positive(box[3]);
    if (boxWidth && boxHeight) return { width: boxWidth, height: boxHeight };
  }
  return undefined;
}

function positive(value?: string): number | undefined {
  const n = value ? Number.parseFloat(value) : Number.NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

/** Pairs a resolved public path with the aspect ratio its frame should reserve. */
function toShot(publicPath: string, fallbackRatio = FALLBACK_RATIO): ProjectShot {
  const size = imageSize(path.resolve(PUBLIC_DIR, "." + publicPath));
  return {
    src: publicPath,
    ratio: size ? `${size.width} / ${size.height}` : fallbackRatio,
  };
}

/** Punctuation-insensitive form used to match a folder to a slug. */
const loose = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Actual folder name for a slug. An exact match wins, then a
 * punctuation-insensitive one, then a folder that merely starts with the slug —
 * so `londonfra` and `awalhrsystem` both land on their project instead of
 * silently rendering placeholders. Slugs are distinct enough that the prefix
 * pass can't reach a different project.
 */
function findProjectDir(slug: string): string | undefined {
  let dirs: string[];
  try {
    dirs = fs
      .readdirSync(PROJECTS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return undefined;
  }

  if (dirs.includes(slug)) return slug;
  const target = loose(slug);
  return (
    dirs.find((dir) => loose(dir) === target) ??
    dirs.find((dir) => loose(dir).startsWith(target))
  );
}

/**
 * Contents of a drop-in folder at `public/projects/<slug>/`: screens under any
 * numbered filename (`1.png`, `2.png`, …) picked up in numeric order at build
 * time, plus the reserved `logo.*` lockup. No renaming to the
 * `work/<slug>-01.jpg` convention, and no gallery count to keep in sync.
 */
function readProjectFolder(slug: string): { logo?: ProjectLogo; shots: ProjectShot[] } {
  if (!SAFE_SLUG.test(slug)) return { shots: [] };

  const dirName = findProjectDir(slug);
  if (!dirName) return { shots: [] };

  const dir = path.join(PROJECTS_DIR, dirName);
  let names: string[];
  try {
    names = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => (isLogoName(name) ? LOGO_FILE.test(name) : SHOT_FILE.test(name)));
  } catch {
    return { shots: [] };
  }

  const shots = names
    .filter((name) => !isLogoName(name))
    .sort(numericOrder)
    .map((name) => toShot(`/projects/${dirName}/${name}`));

  // A plain `logo.*` wins over `awallogo.jpg` and the like.
  const logoName = names.find((name) => /^logo\./i.test(name)) ?? names.find(isLogoName);
  // A logo whose size can't be read (AVIF headers aren't parsed) is dropped —
  // drawn at the wrong ratio it would look worse than none at all.
  const size = logoName
    ? logoName.toLowerCase().endsWith(".svg")
      ? svgSize(path.join(dir, logoName))
      : imageSize(path.join(dir, logoName))
    : undefined;
  const logo = logoName && size ? { src: `/projects/${dirName}/${logoName}`, ...size } : undefined;

  return { logo, shots };
}

/** Brand lockup for a project — `public/projects/<slug>/logo.png`. */
export function projectLogo(slug: string): ProjectLogo | undefined {
  return readProjectFolder(slug).logo;
}

/**
 * Cover shot for a project card / case-study header. Cards crop it to their own
 * ratio; the case study can honour `ratio` to show it uncropped.
 */
export function projectCover(slug: string): ProjectShot | undefined {
  const file = publicAsset(`/images/work/${slug}-cover.jpg`);
  return file ? toShot(file, "16 / 9") : readProjectFolder(slug).shots[0];
}

/**
 * Ordered gallery screens for a case study. Real shots from a project folder
 * win; otherwise the `-01.jpg` convention is tried and each missing slot comes
 * back `undefined` so the caller renders a placeholder.
 */
export function projectGallery(slug: string, count: number): (ProjectShot | undefined)[] {
  const { shots } = readProjectFolder(slug);
  if (shots.length) {
    // Without a dedicated cover file the first shot already heads the page —
    // don't show it twice.
    return publicAsset(`/images/work/${slug}-cover.jpg`) ? shots : shots.slice(1);
  }

  return Array.from({ length: count }, (_, i) => {
    const src = publicAsset(`/images/work/${slug}-${String(i + 1).padStart(2, "0")}.jpg`);
    return src ? toShot(src, i === 0 ? "16 / 9" : "4 / 3") : undefined;
  });
}
