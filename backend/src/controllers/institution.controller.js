import { asyncHandler } from "../helpers/async-handler.js";
import { InstitutionModel } from "../models/institution.model.js";

// GET /api/institutions
export const listInstitutions = asyncHandler(async (req, res) => {
  const institutions = await InstitutionModel.findAll({
    order: [["name", "ASC"]],
  });

  res.json({ institutions });
});
