// One Lucide sprite (packages/ui/icons.svg, copied to public/icons.svg). Decorative by default.

export function Icon({ name, size = 22, className = "i", label }: { name: string; size?: number; className?: string; label?: string }) {
  return (
    <svg className={className} width={size} height={size} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}
