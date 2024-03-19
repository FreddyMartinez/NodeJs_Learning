import { DataTypes, Model } from "sequelize";
import { dbInstance } from "./dbInstance";

class User extends Model {
  public username!: string;
  public email!: string;
  public password!: string;
}

User.init(
  {
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING },
  },
  { sequelize: dbInstance, modelName: "user" }
);

export { User };
