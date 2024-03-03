import { Sequelize } from "sequelize";

const dbInstance = new Sequelize("testapp", "dbuser", "dbpassword", {
  dialect: "sqlite",
  storage: "./database.sqlite",
});

export { dbInstance };
