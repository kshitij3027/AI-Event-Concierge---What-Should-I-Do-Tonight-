import { Router, Request, Response } from "express";
import {
  searchEvents,
  getEventById,
  filterEventsByPrice,
  sortEventsByScore,
} from "../services/seatgeek.js";

const router = Router();

/**
 * GET /api/events
 * Search for events with optional filters
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      q,
      city,
      state,
      date_from,
      date_to,
      taxonomy,
      per_page = "20",
      page = "1",
      sort,
      min_price,
      max_price,
    } = req.query;

    // Build search parameters
    const searchParams = {
      q: q as string | undefined,
      venue_city: city as string | undefined,
      venue_state: state as string | undefined,
      datetime_utc_gte: date_from as string | undefined,
      datetime_utc_lte: date_to as string | undefined,
      taxonomies_name: taxonomy as string | undefined,
      per_page: parseInt(per_page as string, 10),
      page: parseInt(page as string, 10),
      sort: sort as string | undefined,
    };

    console.log("📡 API /events called with:", searchParams);

    // Fetch events from SeatGeek via Composio
    const result = await searchEvents(searchParams);

    // Post-process: filter by price if specified
    let events = result.events;
    const minPriceNum = min_price ? parseInt(min_price as string, 10) : undefined;
    const maxPriceNum = max_price ? parseInt(max_price as string, 10) : undefined;

    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      events = filterEventsByPrice(events, minPriceNum, maxPriceNum);
    }

    // Post-process: sort by score if requested
    if (sort === "score") {
      events = sortEventsByScore(events);
    }

    res.json({
      success: true,
      data: {
        events,
        meta: {
          ...result.meta,
          filtered_count: events.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch events",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/events/:id
 * Get event details by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    if (isNaN(eventId)) {
      res.status(400).json({
        success: false,
        error: "Invalid event ID",
      });
      return;
    }

    console.log("📡 API /events/:id called with:", eventId);

    const event = await getEventById(eventId);

    if (!event) {
      res.status(404).json({
        success: false,
        error: "Event not found",
      });
      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error in GET /api/events/:id:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch event details",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

