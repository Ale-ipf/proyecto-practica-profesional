import { PropertyImageModel } from "./property-image.model.js";
import { PropertyModel } from "./property.model.js";
import { PropertyTenantModel } from "./property-tenant.model.js";
import { RentPaymentModel } from "./rent-payment.model.js";
import { StudentModel } from "./student.model.js";
import { UserModel } from "./user.model.js";
import "./email-verification.model.js";

PropertyModel.belongsTo(UserModel, {
  as: "owner",
  foreignKey: "userId",
});

UserModel.hasMany(PropertyModel, {
  as: "properties",
  foreignKey: "userId",
});

PropertyModel.hasMany(PropertyImageModel, {
  as: "images",
  foreignKey: "propertyId",
  onDelete: "CASCADE",
});

PropertyImageModel.belongsTo(PropertyModel, {
  as: "property",
  foreignKey: "propertyId",
});

PropertyModel.hasMany(PropertyTenantModel, {
  as: "tenants",
  foreignKey: "propertyId",
  onDelete: "CASCADE",
});

PropertyTenantModel.belongsTo(PropertyModel, {
  as: "property",
  foreignKey: "propertyId",
  onDelete: "CASCADE",
});

PropertyTenantModel.belongsTo(UserModel, {
  as: "tenant",
  foreignKey: "userId",
  onDelete: "CASCADE",
});

UserModel.hasMany(PropertyTenantModel, {
  as: "rentalMemberships",
  foreignKey: "userId",
});

PropertyTenantModel.hasMany(RentPaymentModel, {
  as: "payments",
  foreignKey: "propertyTenantId",
  onDelete: "CASCADE",
});

RentPaymentModel.belongsTo(PropertyTenantModel, {
  as: "propertyTenant",
  foreignKey: "propertyTenantId",
  onDelete: "CASCADE",
});

StudentModel.belongsTo(UserModel, {
  as: "user",
  foreignKey: "userId",
});

UserModel.hasOne(StudentModel, {
  as: "studentProfile",
  foreignKey: "userId",
});
