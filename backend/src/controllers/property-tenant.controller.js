import { Op, UniqueConstraintError, col, fn, where } from "sequelize";
import { asyncHandler } from "../helpers/async-handler.js";
import { ApiError } from "../helpers/api-error.js";
import { PropertyTenantModel } from "../models/property-tenant.model.js";
import { RentPaymentModel } from "../models/rent-payment.model.js";
import { UserModel } from "../models/user.model.js";
import { findOwnedPropertyOrFail } from "./property.controller.js";

const getPeriod = (value) => {
  const month = value || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new ApiError(400, "El período debe tener el formato AAAA-MM.");
  }
  return `${month}-01`;
};

// GET /api/properties/:id/tenants?period=AAAA-MM
export const listPropertyTenants = asyncHandler(async (req, res) => {
  await findOwnedPropertyOrFail(req.params.id, req.user.id);
  const period = getPeriod(req.query.period);
  const tenants = await PropertyTenantModel.findAll({
    where: { propertyId: req.params.id },
    include: [
      { model: UserModel, as: "tenant", attributes: ["id", "name", "email"] },
    ],
    order: [["id", "ASC"]],
  });
  const payments = tenants.length
    ? await RentPaymentModel.findAll({
        where: {
          propertyTenantId: { [Op.in]: tenants.map((tenant) => tenant.id) },
          period,
        },
      })
    : [];
  const paymentsByTenant = new Map(
    payments.map((payment) => [payment.propertyTenantId, payment]),
  );

  res.json({
    period,
    tenants: tenants.map((tenant) => {
      const payment = paymentsByTenant.get(tenant.id);
      return {
        id: tenant.id,
        user: tenant.tenant,
        paid: Boolean(payment?.paidAt),
        paidAt: payment?.paidAt || null,
      };
    }),
  });
});

// POST /api/properties/:id/tenants
export const addPropertyTenant = asyncHandler(async (req, res) => {
  await findOwnedPropertyOrFail(req.params.id, req.user.id);
  const user = await UserModel.findOne({
    where: {
      [Op.and]: [
        where(fn("LOWER", col("email")), req.body.email.trim().toLowerCase()),
        { role: "student" },
      ],
    },
    attributes: ["id", "name", "email", "role"],
  });
  if (!user) {
    throw new ApiError(404, "No encontramos una cuenta de estudiante con ese email.");
  }

  const existing = await PropertyTenantModel.findOne({
    where: { propertyId: req.params.id, userId: user.id },
  });
  if (existing) {
    throw new ApiError(409, "Esta persona ya está agregada al alquiler.");
  }

  let tenant;
  try {
    tenant = await PropertyTenantModel.create({
      propertyId: req.params.id,
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(409, "Esta persona ya está agregada al alquiler.");
    }
    throw error;
  }

  res.status(201).json({
    message: "Persona agregada correctamente.",
    tenant: { id: tenant.id, user },
  });
});

// DELETE /api/properties/:id/tenants/:tenantId
export const removePropertyTenant = asyncHandler(async (req, res) => {
  await findOwnedPropertyOrFail(req.params.id, req.user.id);
  const tenant = await PropertyTenantModel.findOne({
    where: { id: req.params.tenantId, propertyId: req.params.id },
  });
  if (!tenant) {
    throw new ApiError(404, "La persona no está agregada a este alquiler.");
  }

  await tenant.destroy();
  res.json({ message: "Persona eliminada del alquiler." });
});

// PUT /api/properties/:id/tenants/:tenantId/payment
export const setPropertyTenantPayment = asyncHandler(async (req, res) => {
  await findOwnedPropertyOrFail(req.params.id, req.user.id);
  const tenant = await PropertyTenantModel.findOne({
    where: { id: req.params.tenantId, propertyId: req.params.id },
  });
  if (!tenant) {
    throw new ApiError(404, "La persona no está agregada a este alquiler.");
  }

  const period = getPeriod(req.body.period);
  const [payment, created] = await RentPaymentModel.findOrCreate({
    where: { propertyTenantId: tenant.id, period },
    defaults: { paidAt: req.body.paid ? new Date() : null },
  });
  if (!created) {
    await payment.update({ paidAt: req.body.paid ? new Date() : null });
  }

  res.json({
    message: req.body.paid
      ? "El pago quedó registrado."
      : "El pago quedó como pendiente.",
    paid: Boolean(payment.paidAt),
    paidAt: payment.paidAt,
  });
});
