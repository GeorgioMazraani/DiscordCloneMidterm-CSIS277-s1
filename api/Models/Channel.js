// models/Channel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");

const Channel = sequelize.define("Channel", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("text", "voice"),
        allowNull: false,
    },
    server_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

Channel.associate = (models) => {
    Channel.hasMany(models.Message, {
        foreignKey: "channel_id",
        as: "Messages",
    });

    Channel.belongsTo(models.Server, {
        foreignKey: "server_id",
        as: "Server",
    });

    Channel.belongsToMany(models.User, {
        through: models.UserChannel,
        as: "Participants",
        foreignKey: "channel_id",
    });
};

module.exports = Channel;
