import { UniqueConstraintError } from "sequelize";
import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { PropertyModel } from "../models/property.model.js";
import { PropertyReviewModel } from "../models/property-review.model.js";
import { UserModel } from "../models/user.model.js";

const reviewInclude = [
  {
    model: UserModel,
    as: "student",
    attributes: ["name", "firstName", "lastName"],
  },
];

function presentReview(review, studentId) {
  const student = review.student;
  const author = [student?.firstName, student?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    author: author || student?.name || "Estudiante",
    isMine: Number(review.studentId) === Number(studentId),
  };
}

// GET /api/properties/:id/reviews (protegida, solo student)
export const listPropertyReviews = asyncHandler(async (req, res) => {
  const property = await PropertyModel.findByPk(req.params.id, {
    attributes: ["id"],
  });
  if (!property) {
    throw new ApiError(404, "Propiedad no encontrada.");
  }

  const reviews = await PropertyReviewModel.findAll({
    where: { propertyId: property.id },
    include: reviewInclude,
    order: [["createdAt", "DESC"]],
  });
  const presentedReviews = reviews.map((review) =>
    presentReview(review, req.user.id),
  );
  const count = presentedReviews.length;

  res.json({
    reviews: presentedReviews,
    rating: {
      average: count
        ? Number(
            (
              presentedReviews.reduce((sum, review) => sum + review.rating, 0) /
              count
            ).toFixed(1),
          )
        : null,
      count,
    },
    myReview: presentedReviews.find((review) => review.isMine) || null,
  });
});

// PUT /api/properties/:id/reviews/me (protegida, solo student)
export const saveMyPropertyReview = asyncHandler(async (req, res) => {
  const property = await PropertyModel.findByPk(req.params.id, {
    attributes: ["id"],
  });
  if (!property) {
    throw new ApiError(404, "Propiedad no encontrada.");
  }

  const existingReview = await PropertyReviewModel.findOne({
    where: { propertyId: property.id, studentId: req.user.id },
  });
  if (existingReview) {
    await existingReview.update({
      rating: req.body.rating,
      comment: req.body.comment,
    });
    return res.json({
      message: "Tu valoración fue actualizada.",
      review: existingReview,
    });
  }

  try {
    const review = await PropertyReviewModel.create({
      propertyId: property.id,
      studentId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    return res.status(201).json({
      message: "Tu valoración fue publicada.",
      review,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(409, "Ya existe una valoración tuya para esta publicación.");
    }
    throw error;
  }
});
