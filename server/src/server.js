const http = require("http");
const app = require("./app");

require("dotenv").config();

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// Loading Mongo from services folder
const { mongoConnect } = require("./services/mongo");

// Loading Data on Startup
const { loadPlanetsData } = require("./models/planets.model");

// Loading Launch Data
const { loadLaunchData } = require("./models/launches.model");

const startServer = async () =>
{
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () =>
    {
        console.log(`Listening on port ${PORT}`);
    });
};

startServer();