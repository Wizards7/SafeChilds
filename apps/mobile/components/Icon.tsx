// One Lucide sprite (packages/ui/icons.svg, copied to public/icons.svg). Decorative by default.
// The query is the sprite's version: bump it whenever a symbol is added, or devices keep the sprite the service
// worker cached and the new icons render empty (2026-10-12). Keep it in step with SHELL in public/sw.js.
export const ICONS_URL = "/icons.svg?v=7";

export function Icon({ name, size = 22, className = "i", label }: { name: string; size?: number; className?: string; label?: string }) {
  return (
    <svg className={className} width={size} height={size} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <use href={`${ICONS_URL}#${name}`} />
    </svg>
  );
}
