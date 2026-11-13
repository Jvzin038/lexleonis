export function isInternalPath(href = '') {
  return href.startsWith('/') && !href.startsWith('//');
}

export function linkifyInternalPaths(content = '') {
  const preservedMarkdown = /(\[[^\]]*\]\([^)]*\)|`[^`]*`|https?:\/\/[^\s]+)/g;
  const internalPath = /(^|[\s(>"'])((?:\/[\p{L}\p{N}][\p{L}\p{N}/_-]*)(?:\?[\p{L}\p{N}_=&%+-]*)?(?:#[\p{L}\p{N}_-]*)?)/gu;

  return content
    .split(preservedMarkdown)
    .map((part, index) => (
      index % 2 === 1 ? part : part.replace(internalPath, (_, prefix, path) => `${prefix}[${path}](${path})`)
    ))
    .join('');
}
