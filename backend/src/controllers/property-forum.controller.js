import { ApiError } from "../helpers/api-error.js";
import { asyncHandler } from "../helpers/async-handler.js";
import { PropertyForumMessageModel } from "../models/property-forum-message.model.js";
import { PropertyTenantModel } from "../models/property-tenant.model.js";
import { PropertyModel } from "../models/property.model.js";
import { UserModel } from "../models/user.model.js";

const authorInclude = {
  model: UserModel,
  as: "author",
  attributes: ["id", "name", "role"],
};

const ensureForumAccess = async (propertyId, user) => {
  const property = await PropertyModel.findByPk(propertyId);
  if (!property) {
    throw new ApiError(404, "Alquiler no encontrado.");
  }

  if (Number(property.userId) === Number(user.id)) return property;

  const membership = await PropertyTenantModel.findOne({
    where: { propertyId: property.id, userId: user.id },
  });
  if (!membership) {
    throw new ApiError(403, "Solo las personas agregadas al alquiler pueden acceder a este foro.");
  }

  return property;
};

// GET /api/properties/:id/forum
export const listPropertyForumMessages = asyncHandler(async (req, res) => {
  const property = await ensureForumAccess(req.params.id, req.user);
  const messages = await PropertyForumMessageModel.findAll({
    where: { propertyId: property.id },
    include: [authorInclude],
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    limit: 100,
  });

  res.json({ messages: messages.reverse() });
});

// POST /api/properties/:id/forum
export const createPropertyForumMessage = asyncHandler(async (req, res) => {
  const property = await ensureForumAccess(req.params.id, req.user);
  const message = await PropertyForumMessageModel.create({
    propertyId: property.id,
    userId: req.user.id,
    category: req.body.category,
    content: req.body.content,
  });
  await message.reload({ include: [authorInclude] });

  res.status(201).json({
    message: "Tu publicación se compartió con las personas del alquiler.",
    forumMessage: message,
  });
});
