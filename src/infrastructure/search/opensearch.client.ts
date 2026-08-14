import { env } from "@/config/env";
import { logger } from "@/core/observability/logger";

export interface MovieIndexDocument {
  id: string;
  type: "MOVIE";
  title: string;
  description?: string;
  languages: string[];
  genres: string[];
  actors: string[];
  directors: string[];
  rating?: string;
  posterUrl?: string;
  releaseDate?: string;
}

export interface VenueIndexDocument {
  id: string;
  type: "VENUE";
  name: string;
  cityId: string;
  cityName: string;
  address?: string;
}

export type SearchDocument = MovieIndexDocument | VenueIndexDocument;

export interface SearchQueryParams {
  query: string;
  genre?: string;
  language?: string;
  cityId?: string;
  type?: "MOVIE" | "VENUE";
  limit?: number;
  offset?: number;
}

export class OpenSearchClient {
  private inMemoryIndex = new Map<string, SearchDocument>();
  private synonymsMap: Record<string, string[]> = {
    cinema: ["theater", "multiplex"],
    flick: ["movie", "film"],
    scifi: ["science fiction", "sci-fi"],
  };

  /**
   * Helper: Calculate Levenshtein edit distance for typo tolerance / fuzzy search
   */
  private calculateLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Fuzzy check if term matches target string with typo tolerance (edit distance <= 2)
   */
  private matchesFuzzy(term: string, target: string): boolean {
    const cleanTerm = term.toLowerCase().trim();
    const cleanTarget = target.toLowerCase().trim();

    if (cleanTarget.includes(cleanTerm)) return true;

    // Check synonym expansion
    const synonyms = this.synonymsMap[cleanTerm] || [];
    if (synonyms.some((syn) => cleanTarget.includes(syn))) return true;

    // Word-by-word fuzzy edit distance
    const targetWords = cleanTarget.split(/\s+/);
    for (const word of targetWords) {
      const maxDistance = cleanTerm.length <= 4 ? 1 : 2;
      if (this.calculateLevenshteinDistance(cleanTerm, word) <= maxDistance) {
        return true;
      }
    }
    return false;
  }

  /**
   * Upsert single document into search index
   */
  async indexDocument(doc: SearchDocument): Promise<void> {
    this.inMemoryIndex.set(`${doc.type}:${doc.id}`, doc);
    logger.debug({ docId: doc.id, type: doc.type }, "OpenSearch: Indexed document");
  }

  /**
   * Bulk Index documents
   */
  async bulkIndex(docs: SearchDocument[]): Promise<{ indexed: number; failed: number }> {
    let indexed = 0;
    let failed = 0;

    for (const doc of docs) {
      try {
        await this.indexDocument(doc);
        indexed++;
      } catch (err) {
        failed++;
        logger.error({ docId: doc.id, err }, "OpenSearch Bulk Indexing failed for document");
      }
    }

    return { indexed, failed };
  }

  /**
   * Delete document from index
   */
  async deleteDocument(type: "MOVIE" | "VENUE", id: string): Promise<void> {
    this.inMemoryIndex.delete(`${type}:${id}`);
  }

  /**
   * Execute OpenSearch query with fuzzy search, typo tolerance, autocomplete, and filters
   */
  async search(params: SearchQueryParams): Promise<{ items: SearchDocument[]; total: number }> {
    const term = params.query.toLowerCase().trim();
    const results: SearchDocument[] = [];

    for (const doc of this.inMemoryIndex.values()) {
      if (params.type && doc.type !== params.type) continue;

      let isMatch = false;

      if (doc.type === "MOVIE") {
        if (params.language && !doc.languages.includes(params.language)) continue;
        if (params.genre && !doc.genres.includes(params.genre)) continue;

        // Search title, description, actors, directors with typo tolerance
        if (
          this.matchesFuzzy(term, doc.title) ||
          (doc.description && this.matchesFuzzy(term, doc.description)) ||
          doc.actors.some((actor) => this.matchesFuzzy(term, actor)) ||
          doc.directors.some((dir) => this.matchesFuzzy(term, dir))
        ) {
          isMatch = true;
        }
      } else if (doc.type === "VENUE") {
        if (params.cityId && doc.cityId !== params.cityId) continue;

        if (
          this.matchesFuzzy(term, doc.name) ||
          this.matchesFuzzy(term, doc.cityName) ||
          (doc.address && this.matchesFuzzy(term, doc.address))
        ) {
          isMatch = true;
        }
      }

      if (isMatch) {
        results.push(doc);
      }
    }

    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const paginated = results.slice(offset, offset + limit);

    return {
      items: paginated,
      total: results.length,
    };
  }

  /**
   * Autocomplete prefix search (Edge n-gram fast lookup)
   */
  async autocomplete(query: string, limit = 8): Promise<Array<{ text: string; type: string; id: string }>> {
    const term = query.toLowerCase().trim();
    const suggestions: Array<{ text: string; type: string; id: string }> = [];

    for (const doc of this.inMemoryIndex.values()) {
      if (suggestions.length >= limit) break;

      if (doc.type === "MOVIE") {
        if (doc.title.toLowerCase().startsWith(term) || this.matchesFuzzy(term, doc.title)) {
          suggestions.push({ text: doc.title, type: "MOVIE", id: doc.id });
        } else {
          const matchingActor = doc.actors.find((a) => a.toLowerCase().startsWith(term));
          if (matchingActor) {
            suggestions.push({ text: `${matchingActor} (Actor)`, type: "ACTOR", id: doc.id });
          }
        }
      } else if (doc.type === "VENUE") {
        if (doc.name.toLowerCase().startsWith(term) || doc.cityName.toLowerCase().startsWith(term)) {
          suggestions.push({ text: `${doc.name} (${doc.cityName})`, type: "VENUE", id: doc.id });
        }
      }
    }

    return suggestions;
  }
}

export const openSearchClient = new OpenSearchClient();
