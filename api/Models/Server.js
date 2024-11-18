// models/Server.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");

const Server = sequelize.define("Server", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    icon: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
    },
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

Server.associate = (models) => {
    Server.belongsTo(models.User, {
        foreignKey: "owner_id",
        as: "Owner",
    });

    Server.hasMany(models.Channel, {
        foreignKey: "server_id",
        as: "Channels",
    });

    Server.belongsToMany(models.User, {
        through: models.UserServer,
        as: "Members",
        foreignKey: "server_id",
    });
};

module.exports = Server;
