import { UserModel } from "./user.model.js";
import { StudentModel } from "./student.model.js";
import { PropertyModel } from "./property.model.js";
import { PropertyImageModel } from "./property-image.model.js";

export const setupAssociations = () => {
  // 1. Relación 1:1 entre User y Student (Perfil de estudiante)
  UserModel.hasOne(StudentModel, { foreignKey: "userId", as: "studentProfile" });
  StudentModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

  // 2. Relación 1:N entre User (Dueño) y Property
  UserModel.hasMany(PropertyModel, { foreignKey: "userId", as: "properties" });
  PropertyModel.belongsTo(UserModel, { foreignKey: "userId", as: "owner" });

  // 3. Relación 1:N entre Property y PropertyImage
  PropertyModel.hasMany(PropertyImageModel, { foreignKey: "propertyId", as: "images" });
  PropertyImageModel.belongsTo(PropertyModel, { foreignKey: "propertyId" });
};