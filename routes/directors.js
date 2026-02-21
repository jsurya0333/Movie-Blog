const express = require('express')
const router = express.Router()
const Director = require('../models/director')
const Movie = require('../models/movie')


//new director route
router.get('/new', (req, res) => {
    res.render('directors/new', { director: new Director() })
})


//create director route
router.post('/', async (req, res) => {
    const director = new Director({
        name: req.body.name
    })
    try {
        const newDirector = await director.save()
        res.redirect(`movies/new`)
    } catch (e) {
        res.render('directors/new', {
            director: director,
            errorMessage: 'Error creating Director'
        })
    }
})

//route for getting directors with specific id /2721482128e81
router.get('/:id' , async(req,res ) => {
    try{
       const director = await Director.findById(req.params.id)
       const movies = await Movie.find({director : director.id}).limit(4).exec()
       res.render('directors/show',{
           director : director,
           moviesByDirector : movies
       })
    }catch{
        res.redirect('/')
    }

})


//exporting the director router to server.js file  
module.exports = router