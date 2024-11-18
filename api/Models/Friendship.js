// models/Friendship.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");

const Friendship = sequelize.define("Friendship", {
    status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
    },
    blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, { timestamps: false });

module.exports = Friendship;
