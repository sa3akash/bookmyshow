import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  extractDbSeats,
  getLayoutBounds,
  getSeatRows,
  normalizeDbSeat,
  normalizeLocalSeat,
  prepareSavePayload,
  validateSeatLayout,
  type DbSeat,
  type RenderSeat,
} from "../utils/seat-layout";
import { SeatCategory, SeatItem } from "@/types";
import { apiClient } from "@/lib/api/client";

interface UseSeatLayoutOptions {
  screenId?: string;
  localSeats?: SeatItem[];
  prices?: Partial<Record<SeatCategory, number>>;
  enabled?: boolean;
}

export function useSeatLayout({
  screenId,
  localSeats = [],
  prices = {},
  enabled = true,
}: UseSeatLayoutOptions) {
  const queryClient = useQueryClient();

  const query = useQuery<DbSeat[]>({
    queryKey: ["seat-layout", screenId],
    enabled: Boolean(screenId) && enabled,
    staleTime: 30_000,
    queryFn: async () => {
      if (!screenId) return [];

      const response = await apiClient.get(
        `/screens/${screenId}/seat-layout`,
      );

      return extractDbSeats(response);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      screenId: targetScreenId,
      venueId,
      seats,
      categoryPrices = prices,
      screenName,
    }: {
      screenId?: string;
      venueId?: string;
      seats: RenderSeat[];
      categoryPrices?: Partial<Record<SeatCategory, number>>;
      screenName?: string;
    }) => {
      const payload = prepareSavePayload(
        targetScreenId || screenId,
        venueId,
        seats,
        categoryPrices,
        screenName,
      );

      const endpoint = (targetScreenId || screenId)
        ? `/screens/${targetScreenId || screenId}/seat-layout`
        : "/screens/layout";

      return await apiClient.post(endpoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seat-layout", screenId] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });

  const dbSeats = useMemo(
    () =>
      (query.data ?? []).map((seat) =>
        normalizeDbSeat(seat, prices),
      ),
    [query.data, prices],
  );

  const localRenderSeats = useMemo(
    () => localSeats.map((seat, index) => normalizeLocalSeat(seat, index)),
    [localSeats],
  );

  const seats = dbSeats.length > 0 ? dbSeats : localRenderSeats;

  const rows = useMemo(() => getSeatRows(seats), [seats]);
  const bounds = useMemo(() => getLayoutBounds(seats), [seats]);
  const validation = useMemo(() => validateSeatLayout(seats), [seats]);

  return {
    ...query,
    dbSeats,
    seats,
    rows,
    bounds,
    validation,
    isUsingDatabase: dbSeats.length > 0,
    saveLayout: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}

