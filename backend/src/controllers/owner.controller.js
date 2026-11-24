import { UniqueConstraintError } from "sequelize";
import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { PropertyModel } from "../models/property.model.js";
import { PropertyReviewModel } from "../models/property-review.model.js";
import { UserModel } from "../models/user.model.js";

const ownerProfileAttributes = [
  "id",
  "name",
  "firstName",
  "lastName",
  "dni",
  "email",
  "phone",
  "emailVerified",
  "phoneVerified",
];

function splitName(user) {
  const parts = (user.name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: user.firstName || parts.shift() || "",
    lastName: user.lastName || parts.join(" "),
  };
}

function maskDni(dni) {
  const digits = String(dni || "").replace(/\D/g, "");
  return digits ? `${"*".repeat(Math.max(0, digits.length - 3))}${digits.slice(-3)}` : null;
}

function formatReview(review, studentId) {
  const student = review.student;
  const studentName = [student?.firstName, student?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    author: studentName || student?.name || "Estudiante",
    isMine: Number(review.studentId) === Number(studentId),
  };
}

function summarizeRating(reviews) {
  const count = reviews.length;
  const average = count
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / count).toFixed(1))
    : null;

  return { average, count };
}

// GET /api/owners/me/profile (protegida, solo owner)
export const getMyOwnerProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.user.id, {
    attributes: ownerProfileAttributes,
  });

  if (!user) {
    throw new ApiError(404, "No se encontró el perfil del propietario.");
  }

  res.json({ profile: { ...user.toJSON(), ...splitName(user) } });
});

// PUT /api/owners/me/profile (protegida, solo owner)
export const updateMyOwnerProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(404, "No se encontró el perfil del propietario.");
  }

  const { firstName, lastName, dni } = req.body;
  const normalizedFirstName = String(firstName || "").trim();
  const normalizedLastName = String(lastName || "").trim();
  const normalizedDni = String(dni || "").replace(/\D/g, "") || null;

  if (!normalizedFirstName || !normalizedLastName) {
    throw new ApiError(400, "El nombre y el apellido son obligatorios.");
  }

  try {
    await user.update({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      name: `${normalizedFirstName} ${normalizedLastName}`.trim(),
      ...(dni !== undefined && { dni: normalizedDni }),
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(409, "Ese DNI ya está asociado a otra cuenta.");
    }
    throw error;
  }

  const profile = await UserModel.findByPk(user.id, {
    attributes: ownerProfileAttributes,
  });
  res.json({
    message: "Perfil actualizado correctamente.",
    profile: { ...profile.toJSON(), ...splitName(profile) },
  });
});

// GET /api/properties/:id/owner-profile (protegida, solo student)
export const getOwnerProfileSummary = asyncHandler(async (req, res) => {
  const property = await PropertyModel.findByPk(req.params.id, {
    attributes: ["id", "userId"],
  });
  if (!property) {
    throw new ApiError(404, "Propiedad no encontrada.");
  }

  const [owner, ownedProperties] = await Promise.all([
    UserModel.findByPk(property.userId, { attributes: ownerProfileAttributes }),
    PropertyModel.findAll({
      where: { userId: property.userId },
      attributes: ["id", "title"],
      include: [
        {
          model: PropertyReviewModel,
          as: "reviews",
          attributes: ["id", "studentId", "rating", "comment", "createdAt"],
          include: [
            {
              model: UserModel,
              as: "student",
              attributes: ["name", "firstName", "lastName"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    }),
  ]);

  if (!owner) {
    throw new ApiError(404, "No se encontró el perfil del propietario.");
  }

  const publications = ownedProperties.map((ownedProperty) => {
    const reviews = ownedProperty.reviews
      .map((review) => formatReview(review, req.user.id))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    return {
      id: ownedProperty.id,
      title: ownedProperty.title,
      rating: summarizeRating(reviews),
      reviews,
      myReview: reviews.find((review) => review.isMine) || null,
    };
  });
  const allReviews = publications.flatMap((ownedProperty) => ownedProperty.reviews);
  const names = splitName(owner);

  res.json({
    owner: {
      id: owner.id,
      ...names,
      name: `${names.firstName} ${names.lastName}`.trim() || owner.name,
      email: owner.email,
      dniMasked: maskDni(owner.dni),
      emailVerified: Boolean(owner.emailVerified),
      phoneVerified: Boolean(owner.phoneVerified),
      verified: Boolean(owner.emailVerified && owner.phoneVerified),
    },
    publicationsCount: ownedProperties.length,
    rating: summarizeRating(allReviews),
    publications,
  });
});
