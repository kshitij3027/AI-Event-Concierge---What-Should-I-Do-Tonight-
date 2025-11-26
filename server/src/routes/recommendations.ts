import { Router, Request, Response } from "express";
import {
  getPersonalizedRecommendations,
  getTrendingEvents,
  getSimilarEvents,
  getHiddenGems,
  getMoodBasedEvents,
  type MoodParams,
  type RecommendationParams,
} from "../services/recommendations.js";

const router = Router();

/**
 * GET /api/recommendations
 * Get personalized recommendations based on user location and interests
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      lat,
      lon,
      city,
      state,
      interests,
      per_page = "12",
      page = "1",
    } = req.query;

    const params: RecommendationParams = {
      lat: lat ? parseFloat(lat as string) : undefined,
      lon: lon ? parseFloat(lon as string) : undefined,
      city: city as string | undefined,
      state: state as string | undefined,
      interests: interests ? (interests as string).split(",") : undefined,
      perPage: parseInt(per_page as string, 10),
      page: parseInt(page as string, 10),
    };

    console.log("📡 API /recommendations called with:", params);

    const result = await getPersonalizedRecommendations(params);

    res.json({
      success: true,
      data: {
        events: result.events,
        meta: result.meta,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/recommendations/trending
 * Get trending events sorted by popularity score
 */
router.get("/trending", async (req: Request, res: Response) => {
  try {
    const {
      lat,
      lon,
      city,
      state,
      per_page = "10",
      page = "1",
    } = req.query;

    const params: RecommendationParams = {
      lat: lat ? parseFloat(lat as string) : undefined,
      lon: lon ? parseFloat(lon as string) : undefined,
      city: city as string | undefined,
      state: state as string | undefined,
      perPage: parseInt(per_page as string, 10),
      page: parseInt(page as string, 10),
    };

    console.log("📡 API /recommendations/trending called with:", params);

    const result = await getTrendingEvents(params);

    res.json({
      success: true,
      data: {
        events: result.events,
        meta: result.meta,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/recommendations/trending:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trending events",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/recommendations/similar/:eventId
 * Get similar events based on a specific event
 */
router.get("/similar/:eventId", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
      res.status(400).json({
        success: false,
        error: "Invalid event ID",
      });
      return;
    }

    const { per_page = "6", page = "1" } = req.query;

    const params: RecommendationParams = {
      perPage: parseInt(per_page as string, 10),
      page: parseInt(page as string, 10),
    };

    console.log("📡 API /recommendations/similar/:eventId called with:", eventId);

    const result = await getSimilarEvents(eventId, params);

    res.json({
      success: true,
      data: {
        events: result.events,
        meta: result.meta,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/recommendations/similar:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch similar events",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/recommendations/hidden-gems
 * Get hidden gem events (quality but not mainstream)
 */
router.get("/hidden-gems", async (req: Request, res: Response) => {
  try {
    const {
      lat,
      lon,
      city,
      state,
      interests,
      per_page = "10",
      page = "1",
    } = req.query;

    const params: RecommendationParams = {
      lat: lat ? parseFloat(lat as string) : undefined,
      lon: lon ? parseFloat(lon as string) : undefined,
      city: city as string | undefined,
      state: state as string | undefined,
      interests: interests ? (interests as string).split(",") : undefined,
      perPage: parseInt(per_page as string, 10),
      page: parseInt(page as string, 10),
    };

    console.log("📡 API /recommendations/hidden-gems called with:", params);

    const result = await getHiddenGems(params);

    res.json({
      success: true,
      data: {
        events: result.events,
        meta: result.meta,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/recommendations/hidden-gems:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hidden gems",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/recommendations/mood
 * Get mood-based event recommendations
 * Query params: energy (high|low|any), social (group|intimate|any), budget (low|medium|high|any)
 */
router.get("/mood", async (req: Request, res: Response) => {
  try {
    const {
      energy = "any",
      social = "any",
      budget = "any",
      lat,
      lon,
      city,
      state,
      per_page = "12",
      page = "1",
    } = req.query;

    // Validate mood params
    const validEnergy = ["high", "low", "any"];
    const validSocial = ["group", "intimate", "any"];
    const validBudget = ["low", "medium", "high", "any"];

    if (!validEnergy.includes(energy as string)) {
      res.status(400).json({
        success: false,
        error: "Invalid energy parameter. Must be 'high', 'low', or 'any'",
      });
      return;
    }

    if (!validSocial.includes(social as string)) {
      res.status(400).json({
        success: false,
        error: "Invalid social parameter. Must be 'group', 'intimate', or 'any'",
      });
      return;
    }

    if (!validBudget.includes(budget as string)) {
      res.status(400).json({
        success: false,
        error: "Invalid budget parameter. Must be 'low', 'medium', 'high', or 'any'",
      });
      return;
    }

    const mood: MoodParams = {
      energy: energy as MoodParams["energy"],
      social: social as MoodParams["social"],
      budget: budget as MoodParams["budget"],
    };

    const params: RecommendationParams = {
      lat: lat ? parseFloat(lat as string) : undefined,
      lon: lon ? parseFloat(lon as string) : undefined,
      city: city as string | undefined,
      state: state as string | undefined,
      perPage: parseInt(per_page as string, 10),
      page: parseInt(page as string, 10),
    };

    console.log("📡 API /recommendations/mood called with:", { mood, params });

    const result = await getMoodBasedEvents(mood, params);

    res.json({
      success: true,
      data: {
        events: result.events,
        meta: {
          ...result.meta,
          mood,
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/recommendations/mood:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch mood-based recommendations",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

