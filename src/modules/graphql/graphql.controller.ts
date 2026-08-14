import { Elysia, t } from "elysia";
import { apollo } from "@elysiajs/apollo";
import { typeDefs } from "./graphql.schema";
import { rootResolvers } from "./graphql.resolver";
import { graphqlService } from "./graphql.service";

export const graphqlController = new Elysia()
  .use(
    apollo({
      path: "/graphql",
      typeDefs,
      resolvers: rootResolvers,
    })
  )
  .post(
    "/graphql",
    async ({ body }) => {
      const result = await graphqlService.execute(body.query, body.variables);
      return result;
    },
    {
      body: t.Object({
        query: t.String({ minLength: 1 }),
        variables: t.Optional(t.Record(t.String(), t.Any())),
      }),
      detail: { tags: ["GraphQL"], summary: "Execute GraphQL queries and mutations" },
    }
  );
