interface URLOptions {
  maxLength?: number;
  includeDate?: boolean;
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
  'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
  'that', 'the', 'to', 'was', 'were', 'will', 'with'
]);

export function generateSEOUrl(text: string, options: URLOptions = {}): string {
  const { maxLength = 60, includeDate = false } = options;
  
  // Convert to lowercase and remove special characters
  let url = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Keep only letters, numbers, spaces and hyphens
    .trim()
    .split(/\s+/)
    .filter(word => !STOP_WORDS.has(word)) // Remove stop words
    .join('-');

  // Ensure no consecutive hyphens
  url = url.replace(/-+/g, '-');

  // Truncate the slug to maxLength if needed, ensuring we don't cut in the
  // middle of a word. Done before appending the date so an optional date
  // suffix is never truncated away.
  if (url.length > maxLength) {
    const truncated = url.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    if (lastHyphen > maxLength * 0.8) { // Only trim at hyphen if it's not too far back
      url = truncated.substring(0, lastHyphen);
    } else {
      url = truncated;
    }
  }

  // Remove trailing hyphen before appending the date
  url = url.replace(/-+$/, '');

  // Add date if requested
  if (includeDate) {
    const year = new Date().getFullYear();
    url = `${url}-${year}`;
  }

  // Remove trailing hyphen if present
  return url.replace(/-+$/, '');
}