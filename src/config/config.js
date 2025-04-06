const config = {
    port: process.env.PORT || 4000, 
    services: {
        catalog: process.env.CATALOG_SERVICE_URL || 'http://localhost:5000', 
        gateway: process.env.GATEWAY_SERVICE_URL || 'http://localhost:3000' 
    }
};

module.exports = config;
