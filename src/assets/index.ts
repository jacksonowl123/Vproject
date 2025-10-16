// Export dummy images
export const dummyImages = {
  logo: '/favicon.ico',
  languageFlag: '/favicon.ico',
  promoCharacter: '/favicon.ico',
  bannerImage: '/favicon.ico'
}

// Generate a local inline SVG placeholder
export function svgPlaceholder(width: number, height: number, bg = '#6B7280', fg = '#FFFFFF', text = ''): string {
  const safeText = encodeURIComponent(text);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
    <rect width='100%' height='100%' fill='${bg}'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='${fg}' font-family='Arial, sans-serif' font-size='${Math.floor(Math.min(width, height)/3)}'>${safeText}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}