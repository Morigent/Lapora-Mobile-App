/** Photo evidence is usually tens of kilobytes — never round it down to "0,0 MB". */
export function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} MB`;
}
