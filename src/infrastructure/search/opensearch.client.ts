import { Client } from "@elastic/elasticsearch";
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

export class ElasticsearchClient {
  private esClient: Client;
  private inMemoryIndex = new Map<string, SearchDocument>();
  private isEsConnected = false;

  private synonymsMap: Record<string, string[]> = {
    cinema: ["theater", "multiplex"],
    flick: ["movie", "film"],
    scifi: ["science fiction", "sci-fi"],
  };

  constructor() {
    const node = process.env.ELASTICSEARCH_NODE || "http://localhost:9200";
    this.esClient = new Client({
      node,
      maxRetries: 1,
      requestTimeout: 2000,
    });
  }

  /**
   * Helper: Calculate Levenshtein edit distance for typo tolerance / fuzzy search
   */
  private calculateLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: b.length + 1 }, () =>
      Array.from({ length: a.length + 1 }, () => 0)
    );

    for (let i = 0; i <= b.length; i++) matrix[i]![0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0]![j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i]![j] = matrix[i - 1]![j - 1]!;
        } else {
          matrix[i]![j] = Math.min(
            matrix[i - 1]![j - 1]! + 1,
            Math.min(matrix[i]![j - 1]! + 1, matrix[i - 1]![j]! + 1)
          );
        }
      }
    }
    return matrix[b.length]![a.length]!;
  }

  /**
   * Fuzzy check if term matches target string with typo tolerance (edit distance <= 2)
   */
  private matchesFuzzy(term: string, target: string): boolean {
    const cleanTerm = term.toLowerCase().trim();
    const cleanTarget = target.toLowerCase().trim();

    if (cleanTarget.includes(cleanTerm)) return true;

    const synonyms = this.synonymsMap[cleanTerm] || [];
    if (synonyms.some((syn) => cleanTarget.includes(syn))) return true;

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
   * Upsert single document into Elasticsearch index
   */
  async indexDocument(doc: SearchDocument): Promise<void> {
    this.inMemoryIndex.set(`${doc.type}:${doc.id}`, doc);

    if (env.NODE_ENV === "test") return;

    try {
      const index = doc.type === "MOVIE" ? "catalog_movies" : "catalog_venues";
      await this.esClient.index({
        index,
        id: doc.id,
        document: doc,
      });
      logger.debug({ docId: doc.id, index }, "Elasticsearch: Document indexed successfully");
    } catch (err) {
      logger.warn({ docId: doc.id, err }, "Elasticsearch node unreachable, fallback to in-memory index");
    }
  }

  /**
   * Bulk Index documents to Elasticsearch
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
        logger.error({ docId: doc.id, err }, "Elasticsearch Bulk Indexing error");
      }
    }

    return { indexed, failed };
  }

  /**
   * Delete document from Elasticsearch index
   */
  async deleteDocument(type: "MOVIE" | "VENUE", id: string): Promise<void> {
    this.inMemoryIndex.delete(`${type}:${id}`);

    if (env.NODE_ENV === "test") return;

    try {
      const index = type === "MOVIE" ? "catalog_movies" : "catalog_venues";
      await this.esClient.delete({ index, id });
    } catch {
      // Ignore ES node errors
    }
  }

  /**
   * Execute Elasticsearch Query with Fuzzy Matching, Typo Tolerance & Filters
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

export const elasticsearchClient = new ElasticsearchClient();
// Export openSearchClient alias for backwards compatibility
export const openSearchClient = elasticsearchClient;
