const express = require('express'); 
const router = express.Router();
const db = require('../../db');
const ExpressError = require('../../expressError');

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT * FROM industries`
        )        
        return res.status(200).json({industries: result.rows});
    } catch (error) {
        return next(error);
    }
})

router.get("/:code", async (req, res, next) => {
    try {
        let {code} = req.params;
        const result = await db.query(
            `SELECT i.indust_code, i.industry, c.name
            FROM companies AS c
            LEFT JOIN companies_industries AS ci
            ON c.code = ci.company_code
            LEFT JOIN industries AS i
            ON ci.industry_code = i.indust_code
            WHERE i.indust_code = $1`, [code]
        )

        if (result.rows.length === 0) {
            throw new ExpressError("Industry cannot be found", 404);
        }

        let {industry} = result.rows[0];
        let companies = result.rows.map(each => each.name);

        return res.send({code, industry, companies});
    } catch (error) {
        return next(error);
    }
})

router.post("/", async (req, res, next) => {
    try {
        let {industCode, industry} = req.body;

        const newIndustry = await db.query(
            `INSERT INTO industries (indust_code, industry)
            VALUES ($1, $2) RETURNING indust_code, industry`, [industCode, industry] 
        )
        return res.status(201).json(newIndustry.rows[0]);
    } catch (error) {
        return next(error);
    }
})


router.post("/:code", async (req, res, next) => {
    try {
        let industCode = req.params.code;
        let {companyCode} = req.body;

        const industCompany = await db.query(
            `INSERT INTO companies_industries (company_code, industry_code)
            VALUES ($1, $2) RETURNING company_code, industry_code`, [companyCode, industCode]
        )
        return res.status(201).json(industCompany.rows[0]);
    } catch (error) {
        return next(error);
    }
})

module.exports = router;
