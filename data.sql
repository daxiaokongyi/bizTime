\c biztime

DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS companies_industries CASCADE;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    indust_code text PRIMARY KEY,
    industry text NOT NULL UNIQUE
);

CREATE TABLE companies_industries (
    company_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
    PRIMARY KEY(company_code, industry_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('pge', 'PG&E', 'Gas & Eletric.'),
          ('amd', 'AMD', 'CPU');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('pge', 900, false, null);

INSERT INTO industries (indust_code, industry)
  VALUES ('util', 'Utility'),
         ('tech', 'High Tech'),
        ('engr', 'Engineering');

INSERT INTO companies_industries
  VALUES  ('apple', 'tech'),
          ('apple', 'engr'),
          ('pge', 'util'),
          ('pge', 'engr'),
          ('amd', 'tech'),
          ('amd', 'engr');

SELECT c.name, i.industry
FROM companies AS c
LEFT JOIN companies_industries AS ci
ON c.code = ci.company_code
LEFT JOIN industries AS i
ON ci.industry_code = i.indust_code;