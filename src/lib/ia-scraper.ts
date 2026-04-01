/**
 * Fetches public metadata from the Internet Archive (no scraping of third-party sites;
 * uses the official Advanced Search JSON API).
 */

export type IaDoc = {
  identifier?: string;
  title?: string;
  description?: string;
  mediatype?: string;
};

export type IaSearchResponse = {
  response?: {
    numFound?: number;
    docs?: IaDoc[];
  };
};

const IA_SEARCH =
  "https://archive.org/advancedsearch.php?q=mediatype:movies+AND+languageSorter:Spanish&fl[]=identifier&fl[]=title&fl[]=description&rows=12&output=json";

export async function fetchSpanishFeatureSamples(): Promise<IaDoc[]> {
  try {
    const res = await fetch(IA_SEARCH, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Relingua/1.0 (educational; +https://example.invalid)" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as IaSearchResponse;
    return data.response?.docs ?? [];
  } catch {
    return [];
  }
}

export function archiveEmbedUrl(identifier: string) {
  return `https://archive.org/embed/${identifier}`;
}

export function archiveDetailsUrl(identifier: string) {
  return `https://archive.org/details/${identifier}`;
}
