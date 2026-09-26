// Gives each category a stable color variant based on its name.
// The actual colors live in index.css (badge-0 ... badge-7) so they adapt
// automatically to light and dark themes.
const BADGE_VARIANTS = 8;

export default function CategoryBadge({ name }) {
  if (!name) return null;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % BADGE_VARIANTS;
  }

  return <span className={`category-badge badge-${hash}`}>{name}</span>;
}
