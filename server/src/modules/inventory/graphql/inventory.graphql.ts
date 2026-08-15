export const inventoryTypeDefs = `
  type SeatInventoryItem {
    seatId: String!
    status: String!
  }

  extend type Query {
    seatInventory(showId: String!): [SeatInventoryItem!]!
  }
`;

export const inventoryResolvers = {
  Query: {
    seatInventory: async (_: unknown, args: { showId: string }) => {
      return [
        { seatId: "A1", status: "AVAILABLE" },
        { seatId: "A2", status: "HELD" },
        { seatId: "A3", status: "BOOKED" },
      ];
    },
  },
};
