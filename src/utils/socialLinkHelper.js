export function getInstagramUrl(input) {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const clean = trimmed.replace('@', '').trim();
  return `https://www.instagram.com/${clean}/`;
}

export function getInstagramDisplayHandle(input) {
  if (!input) return '@instagram';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return `@${parts[0]}`;
      }
    } catch {
      // Fallback
    }
  }
  const clean = trimmed.replace('@', '').split('?')[0].trim();
  return `@${clean}`;
}

export function getGoogleReviewUrl(input) {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(trimmed)}`;
}
