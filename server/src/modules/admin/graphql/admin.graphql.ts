export const adminTypeDefs = `
  type AdminUser {
    id: ID!
    name: String!
    email: String!
    role: String!
    status: String!
    mfaEnabled: Boolean!
  }

  type RoleMatrixItem {
    role: String!
    permissions: [String!]!
  }

  extend type Query {
    adminUsers: [AdminUser!]!
    rolesAndPermissions: [RoleMatrixItem!]!
  }
`;

export const adminResolvers = {
  Query: {
    adminUsers: async () => {
      return [
        { id: "adm-1", name: "Shakil Ahmed", email: "admin@bookmyshow.com", role: "SUPER_ADMIN", status: "ACTIVE", mfaEnabled: true },
        { id: "adm-2", name: "Rafiqul Islam", email: "rafiq@bookmyshow.com", role: "MOVIE_MANAGER", status: "ACTIVE", mfaEnabled: true },
        { id: "adm-3", name: "Sabrina Khan", email: "sabrina@bookmyshow.com", role: "FINANCE_MANAGER", status: "ACTIVE", mfaEnabled: true },
      ];
    },
    rolesAndPermissions: async () => {
      return [
        { role: "SUPER_ADMIN", permissions: ["ALL"] },
        { role: "MOVIE_MANAGER", permissions: ["movie:view", "movie:create", "movie:update", "movie:publish"] },
        { role: "FINANCE_MANAGER", permissions: ["payment:view", "payment:refund", "analytics:financial"] },
      ];
    },
  },
};
