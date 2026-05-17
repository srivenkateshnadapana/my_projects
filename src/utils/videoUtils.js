/**
 * Converts any YouTube or Vimeo URL into an embeddable iframe-compatible URL.
 * Handles standard, short, and URL-with-params formats.
 */
export function getEmbedUrl(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // --- Vimeo ---
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&badge=0&byline=0&portrait=0&title=0`;
    }

    // --- YouTube ---
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&modestbranding=1&rel=0`;
    }

    // --- Direct MP4 or other video files ---
    const extensionMatch = pathname.match(/\.(mp4|webm|ogg)$/i);
    if (extensionMatch) {
      return url; 
    }

    // --- Already an embed URL ---
    if (url.includes('player.vimeo.com') || url.includes('youtube.com/embed')) {
      return url;
    }
  } catch (e) {
    // Fallback for invalid URLs or relative paths
    if (url.includes('vimeo.com') || url.includes('youtube.com') || url.includes('youtu.be')) {
      // Re-run simple regex if URL constructor fails
    } else if (url.split('?')[0].match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }
  }

  return url;
}

/**
 * Returns the type of the video URL so we can render the right player.
 * @returns 'mp4' | 'iframe'
 */
export function getVideoType(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    if (pathname.match(/\.(mp4|webm|ogg)$/i)) {
      return 'mp4';
    }
  } catch (e) {
    if (url.split('?')[0].match(/\.(mp4|webm|ogg)$/i)) {
      return 'mp4';
    }
  }
  
  return 'iframe';
}
