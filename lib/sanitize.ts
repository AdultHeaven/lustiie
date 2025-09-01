// very strict: remove any tags, compress whitespace, block urls to common image hosts
export function sanitizeText(input: string) {
    let s = input ?? '';
    // strip tags
    s = s.replace(/<[^>]*>/g, '');
    // block image/video urls
    s = s.replace(/\b(https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp|mp4|mov|avi|webm))\b/gi, '[link removed]');
    // strip iframes
    s = s.replace(/\b(https?:\/\/(?:pornhub|xvideos|xhamster|onlyfans|fansly|reddit|instagram|tiktok)\S*)\b/gi, '[link nofollow]');
    // trim & normalize spaces
    s = s.replace(/[ \t]+\n/g, '\n').trim();
    return s;
  }
  