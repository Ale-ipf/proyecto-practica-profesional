import { PropertyImageModel } from "./property-image.model.js";
import { PropertyModel } from "./property.model.js";
import { StudentModel } from "./student.model.js";
import { UserModel } from "./user.model.js";

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

StudentModel.belongsTo(UserModel, {
  as: "user",
  foreignKey: "userId",
});

UserModel.hasOne(StudentModel, {
  as: "studentProfile",
  foreignKey: "userId",
});
