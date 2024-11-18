// validators/userValidator.js
const { check } = require("express-validator");
const { getUserByEmail, getUserByUsername } = require("../Services/UserServices");

// Validation for inserting a new user
const insertUserValidation = [
    check("username")
        .notEmpty().withMessage("Username is required")
        .isString().withMessage("Username must be a string")
        .custom(async (username) => {
            const user = await getUserByUsername(username);
            if (user) {
                throw new Error("Username already in use");
            }
            return true;
        }),

    check("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .custom(async (email) => {
            const user = await getUserByEmail(email);
            if (user) {
                throw new Error("Email already in use");
            }
            return true;
        }),

    check("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .isStrongPassword().withMessage("Password is weak. Try adding numbers and special characters"),

    check("avatar")
        .optional()
        .isString().withMessage("Avatar must be a valid URL string"),

    check("status")
        .optional()
        .isIn(["Online", "Offline", "Idle", "Do Not Disturb", "Invisible"])
        .withMessage("Invalid status value"),
];

// Validation for updating user data
const updateUserValidation = [
    check("username")
        .optional()
        .isString().withMessage("Username must be a string")
        .custom(async (username, { req }) => {
            if (username !== req.body.originalUsername) {
                const user = await getUserByUsername(username);
                if (user) {
                    throw new Error("Username already in use");
                }
            }
            return true;
        }),

    check("email")
        .optional()
        .isEmail().withMessage("Invalid email format")
        .custom(async (email, { req }) => {
            if (email !== req.body.originalEmail) {
                const user = await getUserByEmail(email);
                if (user) {
                    throw new Error("Email already in use");
                }
            }
            return true;
        }),

    check("password")
        .optional()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .isStrongPassword().withMessage("Password is weak. Try adding numbers and special characters"),

    check("avatar")
        .optional()
        .isString().withMessage("Avatar must be a valid URL string"),

    check("status")
        .optional()
        .isIn(["Online", "Offline", "Idle", "Do Not Disturb", "Invisible"])
        .withMessage("Invalid status value"),
];

const updateUserEmailValidation = [
    check("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .custom(async (email) => {
            const user = await getUserByEmail(email);
            if (user) {
                throw new Error("Email already in use");
            }
            return true;
        }),
];

const changeUserPasswordValidation = [
    check("old_password")
        .notEmpty().withMessage("Old password is required"),

    check("new_password")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters long")
        .isStrongPassword().withMessage("New password is weak. Try adding numbers and special characters"),
];

const updateUserBioValidation = [
    check("bio")
        .optional()
        .isString().withMessage("Bio must be a string")
        .isLength({ max: 250 }).withMessage("Bio cannot exceed 250 characters"),
];

module.exports = {
    insertUserValidation,
    updateUserValidation,
    updateUserEmailValidation,
    changeUserPasswordValidation,
    updateUserBioValidation,
};
