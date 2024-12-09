const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    avatar: {
        type: DataTypes.BLOB("long"),
    },
    status: {
        type: DataTypes.ENUM("Online", "Offline", "Idle", "Do Not Disturb", "Invisible"),
        defaultValue: "Online",
    },
    isMuted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    faceDescriptor: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    isHeadphonesOn: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

// Define associations
User.associate = (models) => {
    // Friend associations
    User.belongsToMany(models.User, {
        through: models.Friendship,
        as: "Friends",
        foreignKey: "user_id",
        otherKey: "friend_id",
    });
    User.belongsToMany(models.User, {
        through: models.Friendship,
        as: "Requesters",
        foreignKey: "friend_id",
        otherKey: "user_id",
    });

    // Server and channel associations
    User.belongsToMany(models.Server, {
        through: models.UserServer,
        as: "MemberServers",
        foreignKey: "user_id",
    });
    User.belongsToMany(models.Channel, {
        through: models.UserChannel,
        as: "PrivateChannels",
        foreignKey: "user_id",
    });

    // Message associations
    User.hasMany(models.Message, {
        foreignKey: "sender_id",
        as: "Messages",
    });

    // DirectMessage associations
    User.hasMany(models.DirectMessage, {
        foreignKey: "user1_id",
        as: "DirectMessagesUser1",
    });
    User.hasMany(models.DirectMessage, {
        foreignKey: "user2_id",
        as: "DirectMessagesUser2",
    });
};

module.exports = User;
