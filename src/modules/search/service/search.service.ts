import { openSearchClient, SearchQueryParams } from "@/infrastructure/search/opensearch.client";
import { indexingService } from "@/infrastructure/search/indexing.service";

export class SearchService {
  /**
   * Primary Search powered by OpenSearch Engine (Fuzzy matching, Typo tolerance, Actors, Directors, Venues)
   */
  async searchCatalog(params: SearchQueryParams) {
    return await openSearchClient.search(params);
  }

  /**
   * Fast Autocomplete Prefix Search (Sub-second suggestions)
   */
  async autocomplete(query: string) {
    return await openSearchClient.autocomplete(query);
  }

  /**
   * Full Catalog Reindexing Trigger
   */
  async triggerReindex() {
    return await indexingService.reindexAllCatalog();
  }
}

export const searchService = new SearchService();
