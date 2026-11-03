import { asyncHandler } from "../helpers/async-handler.js";
import { InstitutionModel } from "../models/institution.model.js";

const normalizeBusStops = (busStops) => {
  if (Array.isArray(busStops)) return busStops;

  if (typeof busStops === "string") {
    try {
      const parsed = JSON.parse(busStops);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

// GET /api/institutions
export const listInstitutions = asyncHandler(async (req, res) => {
  const institutions = await InstitutionModel.findAll({
    order: [["name", "ASC"]],
  });

  res.json({
    institutions: institutions.map((institution) => ({
      ...institution.toJSON(),
      busStops: normalizeBusStops(institution.busStops),
    })),
  });
});
