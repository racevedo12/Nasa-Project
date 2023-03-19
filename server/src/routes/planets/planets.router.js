const express = require("express");
const planetsRouter = express.Router();

// Controller
const 
{
    httpGetAllPlanets,
    
} = require("./planets.controller");

planetsRouter.get("/", httpGetAllPlanets);


module.exports = planetsRouter;