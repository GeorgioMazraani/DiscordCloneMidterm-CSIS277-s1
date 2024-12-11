const swaggerJsDoc = require("swagger-jsdoc");
require("dotenv").config();

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Discord Clone API",
            version: "1.0.0",
            description: "API documentation for the Discord Clone application.",
            contact: {
                name: "API Support",
                url: "http://www.example.com/support",
                email: "support@example.com"
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT"
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 4000}`,
                description: "Local development server"
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your bearer token in the format **Bearer &lt;token&gt;**"
                },
            },
        },
        security: [
            {
                BearerAuth: []
            }
        ],
    },
    apis: ["./Routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
