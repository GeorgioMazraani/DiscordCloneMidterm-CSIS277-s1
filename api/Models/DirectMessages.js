const { DataTypes } = require("sequelize");
const sequelize = require("../Config/DBConfig");


const DirectMessage = sequelize.define("DirectMessage", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id",
        },
    },
    user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id",
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: false,
});

DirectMessage.associate = (models) => {
    DirectMessage.belongsTo(models.User, {
        foreignKey: "user1_id",
        as: "User1",
    });
    DirectMessage.belongsTo(models.User, {
        foreignKey: "user2_id",
        as: "User2",
    });
};

module.exports = DirectMessage;
