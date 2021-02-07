const mongoose = require('mongoose')
const path = require('path');
const coverImageBasePaht = 'uploads/gameCovers'

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    publishDate: {
        type: Date,
        required: true
    },
    playTime: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    }
})

gameSchema.virtual('coverImagePath').get(function () {
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePaht, this.coverImageName);
    }
})

module.exports = mongoose.model('Game', gameSchema)
module.exports.coverImageBasePaht = coverImageBasePaht