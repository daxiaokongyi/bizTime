process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../../app");
const db = require("../../db");
let testInvoice;

beforeEach(async () => {
    let companyResult = await db.query(
        `INSERT INTO companies
            VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
            ('ibm', 'IBM', 'Big blue.')
            RETURNING code, name, description`
        );

    let invoiceResult = await db.query(
        `INSERT INTO 
            invoices (comp_code, amt, paid, paid_date) 
        VALUES ('apple', 200, false, null)
        RETURNING id, comp_Code, amt, paid, paid_date`
    );

    let invoiceCompany = await db.query(
        `SELECT 
            i.id,
            i.amt,
            i.paid,
            i.add_date,
            i.paid_date,
            c.code,
            c.name,
            c.description
        FROM invoices AS i
        INNER JOIN companies AS c ON (i.comp_code = c.code)
        WHERE id = $1`, [invoiceResult.rows[0].id]
    );

    testInvoice = invoiceResult.rows[0];
    testCompany = companyResult.rows[0];
    testInvoiceCompany = invoiceCompany.rows[0];
});

describe("Random Test", () => {
    test("hello", () => {
        expect(1).toBe(1);
    })
});

describe("GET /invoices", () => {
    test('Get a list of invoices', async () => {
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice[0]).toEqual(expect.objectContaining(testInvoice));
    })
})

describe("GET /invoices/:id", () => {
    test("Get an invoice with a specific id", async () => {
        const data = testInvoiceCompany;
        const curInvoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            paid_date: data.paid_date,
            company: {
                code: data.code,
                name: data.name,
                description: data.description
            }
        }
        const response = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice).toEqual(expect.objectContaining(curInvoice));
    })
    test("Get an invoice that does not exist", async () => {
        const response = await request(app).get(`/invoices/99999`);
        expect(response.statusCode).toBe(404);
    })
});

describe("PUT /invoices/:id", () => {
    test("Update an invoice with a specific id", async () => {
        const response = await request(app).put(`/invoices/${testInvoice.id}`).send({amt:300});
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice).toEqual(expect.objectContaining({amt:300}));
    })
    test("Get an invoice that does not exist", async () => {
        const response = await request(app).get(`/invoices/99999`);
        expect(response.statusCode).toBe(404);
    })
});

describe("POST /invoices", () => {
    test("Create a new invoice", async () => {
        const response = await request(app).post(`/invoices`).send({comp_code: "apple", amt: 300});
        expect(response.statusCode).toBe(201);
        expect(response.body.invoice).toEqual(expect.objectContaining({comp_code: "apple", amt: 300}));
    })
});

describe("DELETE /invoices/:id", () => {
    test("delete an invoice", async () => {
        const response = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({msg: "DELETED"}));
    })
});

afterEach (async () => {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
});

afterAll(async () => {
    // close db connection
    await db.end();
});