const request = require("supertest");
const app = require("../../app");
const 
{ 
    mongoConnect,
    mongoDisconnect, 
} = require("../../services/mongo");

describe("Launches API", () =>
{

    // Before everything runs first connect to the MongoDB Database
    beforeAll( async () =>
    {
        await mongoConnect();
    });

    // After everything ran then disconnect the MongoDB Database
    afterAll( async () =>
    {
        await mongoDisconnect();
    })

    describe("Test GET/launches", () =>
    {
        test("It should respond with 200 success", async () =>
        {
            const response = await request(app)
                .get("/v1/launches")
                .expect("Content-Type", /json/)
                .expect(200)
                
        });
    });

    describe("Test POST /launch", () =>
    {

        const completeLaunchDate = 
        {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
            launchDate: "March 4, 2028",
        }

        const launchDataWithoutDate = 
        {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
        }

        const launchDataWithInvalidDate = 
        {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
            launchDate: "Zeus",
        }

        test("It should respond with 201 created", async () =>
        {
            const response = await request(app)
                .post("/v1/launches")
                .send(completeLaunchDate)
                .expect("Content-Type", /json/)
                .expect(201)

            const requestDate = new Date(completeLaunchDate.launchDate).valueOf();
            const resposeDate = new Date(response.body.launchDate).valueOf();

            expect(resposeDate).toBe(requestDate);

            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test("It should catch missing required properties", async () =>
        {
            const response = await request(app)
                .post("/v1/launches")
                .send(launchDataWithoutDate)
                .expect("Content-Type", /json/)
                .expect(400)

            expect(response.body).toStrictEqual(
                {
                    error: "Missing required launch property",
                }
            );
        });

        test("It should catch invalid dates", async () =>
        {
            const response = await request(app)
                .post("/v1/launches")
                .send(launchDataWithInvalidDate)
                .expect("Content-Type", /json/)
                .expect(400)

            expect(response.body).toStrictEqual(
                {
                    error: "Invalid launch date",
                }
            );
        });
    });
});