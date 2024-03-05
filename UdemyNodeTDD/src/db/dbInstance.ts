import { Sequelize } from "sequelize";
import config from "config";

const dbConfig = config.get("database") as Config;

const dbInstance = new Sequelize(dbConfig.name, dbConfig.username, dbConfig.password, {
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: false,
});

export { dbInstance };
