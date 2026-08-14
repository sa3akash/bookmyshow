import { graphql } from "graphql";
import { schema } from "./graphql.schema";
import { rootResolvers } from "./graphql.resolver";

export class GraphQLService {
  async execute(query: string, variables?: Record<string, unknown>) {
    const result = await graphql({
      schema,
      source: query,
      rootValue: {
        ...rootResolvers.Query,
        ...rootResolvers.Mutation,
      },
      variableValues: variables,
    });
    return result;
  }
}

export const graphqlService = new GraphQLService();
