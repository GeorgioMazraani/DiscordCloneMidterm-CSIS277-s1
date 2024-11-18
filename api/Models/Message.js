const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id",
        },
    },
    channel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Channels",
            key: "id",
        },
    },
    dm_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "DirectMessages",
            key: "id",
        },
    },
}, {
    timestamps: false,
});

Message.associate = (models) => {
    Message.belongsTo(models.User, {
        foreignKey: "sender_id",
        as: "Sender",
    });

    Message.belongsTo(models.Channel, {
        foreignKey: "channel_id",
        as: "Channel",
    });

    Message.belongsTo(models.DirectMessage, {
        foreignKey: "dm_id",
        as: "DirectMessage",
    });
};

module.exports = Message;
