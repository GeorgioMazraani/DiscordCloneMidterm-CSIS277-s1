const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");

const UserServer = sequelize.define("UserServer", {}, { timestamps: false });

module.exports = UserServer;
