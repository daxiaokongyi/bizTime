const express = require('express'); 
const router = express.Router();
const db = require('../../db');
const ExpressError = require('../../expressError');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices ORDER BY id`);
        return res.status(200).json({invoice: results.rows});
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        
        const results = await db.query(
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
            WHERE id = $1`, [id]);

        if (results.rows.length === 0) {
            throw new ExpressError("No invoices found", 404);
        }

        console.log(results);
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company: {
                code: data.code,
                name: data.name,
                description: data.description
            }
        }
        return res.status(200).json({invoice: invoice});
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body;

        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) 
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const {amt} = req.body;
        let paidDate = null;

        const currentResult = await db.query(
            `UPDATE invoices SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [amt, id]
        );

        if (currentResult.rows.length === 0) {
            throw new ExpressError("Invoices cannot be found", 404);
        }

        let currentPaidDate = currentResult.rows[0].paid_date;
        let paid = currentResult.rows[0].paid;

        if (!currentPaidDate && paid) {
            paidDate = new Date();
        } else if (currentPaidDate && !paid) {
            paidDate = null;
        } else {
            // console.log('here');
            paidDate = new Date();
            paid = true;
        }

        const results = await db.query(
            `UPDATE invoices 
            SET amt = $1, paid = $2, paid_date = $3
            WHERE id = $4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [amt, paid, paidDate, id]
        );

        return res.status(200).json({invoice: results.rows[0]});
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;

        let currentResult = await db.query(
            `SELECT * FROM invoices WHERE id = $1`, [id]
        );

        console.log(currentResult);
        if (currentResult.rows.length === 0) {
            throw new ExpressError("No invoice found", 404)
        }
        
        const results = await db.query(
            `DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]
        );

        return res.status(200).json({msg: "DELETED"});
    } catch (error) {
        return next(error);
    }
});


module.exports = router;