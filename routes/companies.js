const express = require('express')
const router = express.Router()
const Company = require('../models/company')

// All Companies Route
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }

    try {
        const companies = await Company.find(searchOptions)
        res.render('companies/index', { companies: companies, searchOptions: req.query })
    } catch (error) {
        res.redirect('/')
    }
    

})

// New Company Route
router.get('/new', (req, res) => {
    res.render('companies/new', {
        company: new Company()
    })
})

// Create Company Route
router.post('/', async (req, res) => {
    const company = new Company({
        name: req.body.name
    })
    try {
        const newCompany = await company.save();
        res.redirect('companies')
        // res.redirect(`companies/${newCompany.id}`)
    } catch {
        res.render('companies/new', {
            company: company,
            errorMessage: 'Error creating Company'
        })
    }
})


module.exports = router