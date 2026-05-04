export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function isPastDue(value) {
  if (!value) return false;
  return new Date(`${value}T23:59:59`) < new Date();
}
