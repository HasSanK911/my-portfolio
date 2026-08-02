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

/** Cover shot for a project card / case-study header. */
export function projectCover(slug: string) {
  return publicAsset(`/images/work/${slug}-cover.jpg`);
}

/** Ordered gallery screens for a case study, `undefined` where not yet added. */
export function projectGallery(slug: string, count: number) {
  return Array.from({ length: count }, (_, i) =>
    publicAsset(`/images/work/${slug}-${String(i + 1).padStart(2, "0")}.jpg`),
  );
}
