const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const User = require('../models/user')


//router to access posts by Other user
router.get('/:id/posts', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const movies = await Movie.find({ postedBy: user }).exec()
        res.render('user/posts', {
            user: user,
            postedByUser: movies
        })
    }catch{
        res.redirect('/movies')
    }
})


//exporting router to server.js file
module.exports = router