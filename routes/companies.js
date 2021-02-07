const express = require('express')
const router = express.Router()
const Company = require('../models/company')
const Game = require('../models/game')

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
        res.redirect(`companies/${newCompany.id}`)
    } catch {
        res.render('companies/new', {
            company: company,
            errorMessage: 'Error creating Company'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
        const games = await Game.find({ company: company.id }).limit(6).exec()
        res.render('companies/show', {
            company: company,
            gamesByCompany: games
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id', (req, res) => {
    res.send('show companies ' + req.params.id)
})

router.get('/:id/edit', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
        res.render('companies/edit', { company: company })
    } catch {
        res.redirect("/companies")
    }
})

router.put('/:id', async (req, res) => {
    let company;
    try {
        company = await Company.findById(req.params.id)
        company.name = req.body.name;
        await company.save();
        res.redirect(`/companies/${company.id}`)
    } catch {
        if (company == null) {
            res.redirect('/')
        } else {
            res.render('companies/edit', {
                company: company,
                errorMessage: 'Error updating Company'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let company;
    try {
        company = await Company.findById(req.params.id)
        await company.remove();
        res.redirect(`/companies`)
    } catch {
        if (company == null) {
            res.redirect('/')
        } else {
            res.redirect(`/companies/${company.id}`)
        }
    }
})


module.exports = router