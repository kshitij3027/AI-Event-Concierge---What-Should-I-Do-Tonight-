import { Router, Request, Response } from "express";
import { getTaxonomies } from "../services/seatgeek.js";

const router = Router();

/**
 * GET /api/taxonomies
 * Get available event categories/taxonomies
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    console.log("📡 API /taxonomies called");

    const taxonomies = await getTaxonomies();

    res.json({
      success: true,
      data: {
        taxonomies,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/taxonomies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch taxonomies",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

