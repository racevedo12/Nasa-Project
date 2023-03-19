const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

const getAllLaunches = async (skip, limit) =>
{
    return await launches
        .find( {}, {"_id": 0, "__v": 0} )
        .sort({ flightNumber: 1})
        .skip(skip)
        .limit(limit);
};

const saveLaunch = async (launch) =>
{
    await launches.updateOne
    (
        {
            flightNumber: launch.flightNumber
        },

        launch,

        {
            upsert: true,
        }
    );
};

const findLaunch = async (filter) =>
{
    return await launches.findOne(filter);
};

const populateLaunches = async () =>
{
    console.log("Downloading data");
    
    const response = await axios.post(SPACEX_API_URL,
        {
            query: {},
            options: 
            {
                pagination: false,
                populate:
                [
                    {
                        path: "rocket",
                        select: 
                        {
                            name: 1
                        }
                    },
                    {
                        path: "payloads",
                        select:
                        {
                            "customers": 1
                        }
                    }
                ]
            }
        }
    )

    if( response.status !== 200)
    {
        console.log(`Problem downloading launch data`);
        throw new Error(`Launch data download failed`);
    }

    const launchDocs = response.data.docs;

    for( let launchDoc of launchDocs )
    {
        const payloads = launchDoc["payloads"];
        const customers = payloads.flatMap( (payload) => 
        {
            return payload["customers"];
        });

        const launch = 
        {
            flightNumber: launchDoc["flight_number"],
            mission: launchDoc["name"],
            rocket: launchDoc["rocket"]["name"],
            launchDate: launchDoc["date_local"],
            customers: ["ZTM","NASA"], 
            upcoming: launchDoc["upcoming"],
            success: launchDoc["success"],
            customers: customers,
        }

        console.log(`${launch.flightNumber}  ${launch.mission}`);
        
        await saveLaunch(launch);
    }
};

const loadLaunchData = async () =>
{
    const firstLaunch = await findLaunch(
        {
            flightNumber: 1,
            rocket: "Falcon 1",
            mission: "FalconSat"
        }
    );

    if( firstLaunch )
    {
        console.log(`Launch data already loaded!`);
        return;
    }

    else
    {
        await populateLaunches();
    }
};

// Utility Async Function
const getLatestFlightNumber = async () =>
{
    const latestLunch = await launches
        .findOne({})
        .sort("-flightNumber");

    if( !latestLunch )
    {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLunch.flightNumber;
};

const scheduleNewLaunch = async (launch) =>
{
    const planet = await planets.findOne( {keplerName: launch.target} );
    
    if (!planet)
    {
        throw new Error(`No matching planet found`);
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = 
    {...launch, 
        success: true,
        upcoming: true,
        customers: ["Zero to Mastery", "NASA",],
        flightNumber: newFlightNumber,
    };

    await saveLaunch(newLaunch);
};

const existsLaunchWithId = async (launchId) =>
{
    return await findLaunch(
        {
            flightNumber: launchId,
        }
    );
};

const abortLaunchById = async (launchId) =>
{
    const aborted = await launches.updateOne(
        {
            flightNumber: launchId
        },
        {
            upcoming: false,
            success: false,
        }
    );

    return aborted.modifiedCount === 1;
};

module.exports = 
{
    getAllLaunches,
    loadLaunchData,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
}