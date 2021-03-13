const express = require('express'); 
const router = express.Router();
const db = require('../../db');
const slugify = require('slugify');
const ExpressError = require('../../expressError');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT * FROM companies ORDER BY name`
        );
        return res.status(200).json({companies: results.rows});
    } catch (error) {
        return next(error);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;

        const companyResult = await db.query(
            `SELECT * FROM companies WHERE code = $1`, [code]
        );

        if (companyResult.rows.length === 0) {
            throw new ExpressError("No such a company", 404);
        }

        const invoiceResult = await db.query(
            `SELECT id FROM invoices WHERE comp_code = $1`, [code]
        )

        const industryResult = await db.query(
            `SELECT c.name, i.industry
            FROM companies AS c
            LEFT JOIN companies_industries AS ci
            ON c.code = ci.company_code
            LEFT JOIN industries AS i
            ON ci.industry_code = i.indust_code
            WHERE c.code = $1`, [code]
        )

        if (invoiceResult.rows.length !== 0) {
            // if company exists, set invoices to the specific company
            companyResult.rows[0].invoices = invoiceResult.rows.map(invoice => invoice.id);
        } else {
            companyResult.rows[0].invoices = [];
        }

        if (industryResult.rows.length !== 0) {
            companyResult.rows[0].industries = industryResult.rows.map(each => each.industry);
        }

        return res.status(200).json({company: companyResult.rows[0]});
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        let {code, name, description} = req.body;
        name = slugify(name, {lower: true});

        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3) RETURNING code, name, description`, 
            [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    } catch (error) {
        return next(error);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;
        const {name, description} = req.body;

        const results = await db.query(
            `UPDATE companies SET name = $1, description = $2 
            WHERE code = $3
            RETURNING code, name, description`, 
            [name, description, code]
        );

        if (results.rows.length === 0) {
            throw new ExpressError("No company was found", 404)
        }
        return res.status(200).json({company: results.rows[0]});
    } catch (error) {
        return next(error);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;

        let currentResult = await db.query(
            `SELECT * FROM companies WHERE code = $1`, [code]
        );

        if (currentResult.rows.length === 0) {
            throw new ExpressError("No company found", 404)
        }

        const results = await db.query(
            `DELETE FROM companies WHERE code = $1 RETURNING code, name`, [code]
        );

        return res.status(200).json({msg: "DELETED"});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;