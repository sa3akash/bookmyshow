export const auditTypeDefs = `
  type AuditLogItem {
    id: ID!
    timestamp: String!
    adminName: String!
    adminEmail: String!
    action: String!
    resource: String!
    resourceId: String!
    ipAddress: String!
    status: String!
  }

  extend type Query {
    auditLogs(limit: Int): [AuditLogItem!]!
  }
`;

export const auditResolvers = {
  Query: {
    auditLogs: async (_: unknown, args: { limit?: number }) => {
      return [
        { id: "aud-1", timestamp: "2026-08-15T06:05:00Z", adminName: "Shakil Ahmed", adminEmail: "admin@bookmyshow.com", action: "movie:publish", resource: "Movie", resourceId: "m-101", ipAddress: "192.168.1.5", status: "SUCCESS" },
        { id: "aud-2", timestamp: "2026-08-15T05:25:00Z", adminName: "Sabrina Khan", adminEmail: "sabrina@bookmyshow.com", action: "payment:refund", resource: "Refund", resourceId: "RF-9901", ipAddress: "192.168.1.12", status: "SUCCESS" },
        { id: "aud-3", timestamp: "2026-08-15T04:10:00Z", adminName: "Rafiqul Islam", adminEmail: "rafiq@bookmyshow.com", action: "role:delete", resource: "Role", resourceId: "ROLE_TEMP", ipAddress: "192.168.1.8", status: "DENIED" },
      ].slice(0, args.limit || 10);
    },
  },
};
