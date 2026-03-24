import { Note, WikiLink, Backlink } from '@notes-app/shared';

export type { WikiLink, Backlink } from '@notes-app/shared';

export function parseWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = [];
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    links.push({
      raw: match[0],
      title: match[2] || match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return links;
}

export function extractLinkTitles(content: string): string[] {
  return parseWikiLinks(content).map(link => link.title);
}

export function resolveLinkToNote(linkTitle: string, notes: Note[]): Note | undefined {
  const normalizedTitle = linkTitle.toLowerCase().trim();
  return notes.find(
    note => note.title.toLowerCase().trim() === normalizedTitle
  );
}

export function buildBacklinksMap(notes: Note[]): Map<string, Backlink[]> {
  const backlinksMap = new Map<string, Backlink[]>();

  notes.forEach(note => {
    const linkTitles = extractLinkTitles(note.content);
    
    linkTitles.forEach(linkTitle => {
      const linkedNote = resolveLinkToNote(linkTitle, notes);
      
      if (linkedNote && linkedNote.id !== note.id) {
        const existingBacklinks = backlinksMap.get(linkedNote.id) || [];
        
        const contextStart = Math.max(0, note.content.indexOf(`[[${linkTitle}`) - 50);
        const contextEnd = Math.min(note.content.length, note.content.indexOf(`[[${linkTitle}`) + 100);
        const context = note.content.slice(contextStart, contextEnd).replace(/\n/g, ' ').trim();
        
        if (!existingBacklinks.some(bl => bl.noteId === note.id)) {
          existingBacklinks.push({
            noteId: note.id,
            noteTitle: note.title,
            notePath: note.path,
            context: (contextStart > 0 ? '...' : '') + context + (contextEnd < note.content.length ? '...' : ''),
          });
          backlinksMap.set(linkedNote.id, existingBacklinks);
        }
      }
    });
  });

  return backlinksMap;
}

export function contentToMarkdown(content: string, notes: Note[]): string {
  const links = parseWikiLinks(content);
  let result = content;
  
  links.forEach(link => {
    const linkedNote = resolveLinkToNote(link.title, notes);
    if (linkedNote) {
      result = result.replace(
        link.raw,
        `[${link.title}](note://${linkedNote.id})`
      );
    } else {
      result = result.replace(
        link.raw,
        `<span class="wikilink wikilink-missing">${link.title}</span>`
      );
    }
  });

  return result;
}

export function countLinks(content: string): number {
  return parseWikiLinks(content).length;
}
