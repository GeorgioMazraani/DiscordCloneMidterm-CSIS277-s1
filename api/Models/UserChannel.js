const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");

const UserChannel = sequelize.define("UserChannel", {}, { timestamps: false });

module.exports = UserChannel;
