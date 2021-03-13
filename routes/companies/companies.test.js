process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../../app");
const db = require("../../db");

let testCompany;

beforeEach(async () => {
    let resultCompany = await db.query(
        `INSERT INTO 
            companies (code, name, description) 
        VALUES ('apple', 'Apple', 'Apple MAC')
        RETURNING code, name, description`
    );
    testCompany = resultCompany.rows[0];

    let resultIndustry = await db.query(
        `INSERT INTO 
            industries (indust_code, industry) 
        VALUES ('tech', 'High Tech')
        RETURNING indust_code, industry`
    );
    testIndustry = resultIndustry.rows[0];

    let resultComInd = await db.query(
        `INSERT INTO 
            companies_industries 
        VALUES  ('apple', 'tech')`
    );
    testComInd = resultComInd.rows[0];
});


describe("hope this works", () => {
    test("blah", () => {
        expect(1).toBe(1);
    });
});

describe("GET /companies", () => {
    test("Gets a list of companies", async () => {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
            {companies: [testCompany]}
        );
    });
});

describe("GET /companies/:code", () => {
    test("Gets a company with code", async () => {
        console.log(testCompany.code);
        const response = await request(app).get(`/companies/${testCompany.code}`);
        console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body.company).toEqual(expect.objectContaining(testCompany));
    });
    test("Get a company does not exist", async () => {
        const response = await request(app).get(`/companies/lego`);
        expect(response.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("Create a new company", async () => {
        const res = await request(app).post('/companies').send({code: 'google', name: 'Google Book', description: "It's a Google Book" }); 
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: {code: 'google', name: "google-book", description: "It's a Google Book"}
        });
    });
});

describe("PUT /companies/:code", () => {
    test("Edit an existing company", async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({name: 'Apple Book II', description: "It's a second generation Apple Book" }); 
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {code: "apple", name: "Apple Book II", description: "It's a second generation Apple Book"}
        });
    });

    test("Edit a company does not exist", async () => {
        const res = await request(app).put(`/companies/aacscscssa`).send({name: 'Apple Book II', description: "It's a second generation Apple Book" }); 
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /companies/:code", () => {
    test("DELETE an existing company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: "DELETED"});
    });

    test("Delete a company does not exist", async () => {
        const res = await request(app).delete(`/companies/aacscscssa`);
        expect(res.statusCode).toBe(404);
    });
});

afterEach (async () => {
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM industries");
    await db.query("DELETE FROM companies_industries");
});

afterAll(async () => {
    // close db connection
    await db.end();
});
