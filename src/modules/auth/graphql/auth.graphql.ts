import { authService } from "../service/auth.service";

export const authTypeDefs = `
  type User {
    id: ID!
    email: String!
    fullName: String!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  extend type Query {
    me(userId: String!): User
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }
`;

export const authResolvers = {
  Query: {
    me: async (_: unknown, args: { userId: string }) => {
      const perms = await authService.getUserPermissions(args.userId);
      return {
        id: args.userId,
        email: "user@example.com",
        fullName: perms.rolesList.join(", ") || "User",
      };
    },
  },
  Mutation: {
    login: async (_: unknown, args: { email: string; password: string }) => {
      return await authService.login({ email: args.email, password: args.password });
    },
  },
};
