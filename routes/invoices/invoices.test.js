process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../../app");
const db = require("../../db");

let testInvoice;

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO 
            invoices (comp_Code, amt, paid, add_date, paid_date) 
        VALUES ('apple', 200, false, '2021', null)
        RETURNING comp_Code, amt, paid, add_date, paid_date`
    );
    testInvoice = result.rows[0];
});

describe("Random Test", () => {
    test("hello", () => {
        // console.log(testInvoice);
        expect(1).toBe(1);
    })
});

afterEach (async () => {
    await db.query("DELETE FROM invoices");
});

afterAll(async () => {
    // close db connection
    await db.end();
});