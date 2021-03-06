const express = require('express')
const router = express.Router()
const Game = require('../models/game')
const Company = require('../models/company')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// All Games Route
router.get('/', async (req, res) => {
    let query = Game.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const games = await query.exec()
        res.render('games/index', {
            games: games,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Game Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Game())
})

// Create Game Route
router.post('/', async (req, res) => {
    const game = new Game({
        title: req.body.title,
        company: req.body.company,
        publishDate: new Date(req.body.publishDate),
        playTime: req.body.playTime,
        description: req.body.description
    })
    saveCover(game, req.body.cover)

    try {
        const newGame = await game.save()
        res.redirect(`games/${newGame.id}`)
    } catch {
        renderNewPage(res, game, true)
    }
})

// Show Game Route
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
            .populate('company')
            .exec();
            res.render('games/show', { game: game })
    } catch {
        res.redirect('/')
    }
})

// Edit Game Route
router.get('/:id/edit', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
        renderEditPage(res, game)
    } catch {
        res.redirect('/')
    }
})

// Update Game Route
router.put('/:id', async (req, res) => {
    let game;

    try {
        game = await Game.findById(req.params.id)
        game.title = req.body.title
        game.company = req.body.company
        game.publishDate = new Date(req.body.publishDate)
        game.playTime = req.body.playTime
        game.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(game, req.body.cover)
        }
        await game.save();
        res.redirect(`/games/${game.id}`)
    } catch {
        if (game != null) {
            renderEditPage(res, game, true)
        } else {
            res.redirect('/')
        }
    }
})

// Delete Game Page
router.delete('/:id', async (req, res) => {
    let game;
    try {
        game = await Game.findById(req.params.id)
        await game.remove()
        res.redirect('/games')
    } catch {
        if (game != null) {
            res.redirect('games/show', {
                game: game,
                errorMessage: 'Could not remove game'
            })
        } else {
            res.redirect('/')
        }
    }
})

//TODO Wrzucić te funkcje renderNewPage oraz renderEditPage do router'ów które je wywołują
async function renderNewPage(res, game, hasError = false) {
    renderFormPage(res, game, 'new', hasError)
}

async function renderEditPage(res, game, hasError = false) {
    renderFormPage(res, game, 'edit', hasError)
}

async function renderFormPage(res, game, form, hasError = false) {
    try {
        const companies = await Company.find({});
        const params = {
            companies: companies,
            game: game
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Game'    
            } else {
                params.errorMessage = 'Error Creating Game'
            }
        }
        res.render(`games/${form}`, params)
    } catch (error) {
        console.log(error);
        res.redirect('/games')
    }
}

function saveCover(game, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        game.coverImage = new Buffer.from(cover.data, 'base64')
        game.coverImageType = cover.type
    }
}

module.exports = router