const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path')
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
        // res.redirect(`game/${newGame.id}`)
        res.redirect('games')
    } catch {
        renderNewPage(res, game, true)
    }
})

async function renderNewPage(res, game, hasError = false) {
    try {
        const companies = await Company.find({});
        const params = {
            companies,
            game
        }
        if(hasError) params.errorMessage = 'Error Creating Game'
        res.render('games/new', params)
    } catch (error) {
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