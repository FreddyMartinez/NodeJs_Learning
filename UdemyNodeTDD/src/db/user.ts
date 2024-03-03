import { DataTypes } from "sequelize";
import { dbInstance } from "./dbInstance";

const User = dbInstance.define("user", {
  username: { type: DataTypes.STRING},
  email: DataTypes.STRING,
  password: { type: DataTypes.STRING},
});

export { User };
