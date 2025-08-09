const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API Documentation for This Project !',
        version: '1.0.0',
        description: 'API documentation ',
    },
    components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
   
    servers: [
        {
            url: 'https://new-camme-project.onrender.com/api/v1',
                // 'http://localhost:4000/api/v1',
        },
    ],
}


// options for the swagger docs
const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'], // path where API docs are written
}


// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

module.exports = (app) => {
    // Serve swagger docs the way you like (Recommendation: swagger-tools)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
