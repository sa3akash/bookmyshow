import { describe, expect, test } from "bun:test";
import { EventService } from "@/modules/events/event.service";

describe("EVENTS, CONCERTS & SPORTS SUBSYSTEM TEST", () => {
  test("EventService instantiates and exposes listing & creation methods", () => {
    const service = new EventService();
    expect(service.listEvents).toBeDefined();
    expect(service.getEventDetails).toBeDefined();
    expect(service.createEvent).toBeDefined();
  });
});
