const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const User = require('../models/user')
const Director = require('../models/director')
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
const passport = require('passport')


//route for getting all movies by users and also searching by movie name
router.get('/', checkAuthenticated, async (req, res) => {
    let query = Movie.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.releasedBefore != null && req.query.releasedBefore != '') {
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if (req.query.releasedAfter != null && req.query.releasedAfter != '') {
        query = query.gte('releaseDate', req.query.releasedAfter)
    } 
    try {
        const movies = await query.exec()
        res.render('movies/index', {
            movies: movies,
            searchOptions: req.query
        })
    }
    catch {
        res.redirect('/')
    }
})


//new movie post route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Movie())
})


//route for posting a new movie post 
router.post('/',checkAuthenticated ,async (req, res) => {
    const user = req.user.id
    const movie = new Movie({
        title: req.body.title,
        director: req.body.director,
        releaseDate: new Date(req.body.releaseDate),
        runTime: req.body.runTime,
        description: req.body.description,
        postedBy:user
    })
    saveCover(movie, req.body.cover)
    try {
        const newMovie = await movie.save()
        console.log('submitted')
        res.redirect(`movies/${newMovie.id}`) 
    } catch (err) {
        console.log(err)
        renderNewPage(res, movie, true)
    }
})

//route for getting movie post with specific id
router.get('/:id', checkAuthenticated,async (req,res)=>{
  try{
       const user = await Movie.findById(req.params.id)
                              .populate('postedBy')
                              .exec() 
      const movie = await Movie.findById(req.params.id)
                               .populate('director')
                               .exec()
      res.render('movies/show',{movie : movie,user:user})
  }catch(e){
    console.log(e)
      res.redirect('/')
  }
})


//route for editing movie post with id
router.get('/:id/edit', checkAuthenticated, async (req, res) => {
    try{
     const movie = await Movie.findById(req.params.id)
     
      renderEditPage(res, movie)
    }catch{
        res.redirect('/')
    }
})



//route for updating movie post with id
router.put('/:id', checkAuthenticated, async (req, res) => {

    let movie 
    try {
        movie = await Movie.findById(req.params.id)
        movie.title = req.body.title
        movie.director = req.body.director
        movie.releaseDate = new Date(req.body.releaseDate)
        movie.runTime = req.body.runTime
        movie.description = req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(movie,req.body.cover)
        }
        await movie.save()
        res.redirect('/myPosts')
    } catch {
        if(movie != null){
              renderEditPage(res, movie, true)
        }else{
            redirect('/')
        }
        
    }
})

//route for deleting a movie post with id
router.delete('/:id', checkAuthenticated, async(req,res)=>{
    let movie 
    try{
        movie = await Movie.findById(req.params.id)
        await movie.remove()
        res.redirect('/myPosts')
    }catch{
        if( movie != null){
           res.render('movies/show',{
               movie : movie,
               errorMessage : 'Could not remove movie'
           }) 
        }else{
            res.redirect('/')
        }
    }
})

//function for rendering new movie page
async function renderNewPage(res, movie, hasError = false) {
    renderFormPage(res,movie,'new',hasError)
}

//function for rendering movie edit page
async function renderEditPage(res, movie, hasError = false) {
    renderFormPage(res,movie,'edit',hasError)
}

//common functionality for both edit and new movie post
async function renderFormPage(res, movie, form, hasError = false) {
    try {
        const directors = await Director.find({})
        const params = {
            directors: directors,
            movie: movie
        }
        if(hasError){
            if(form == 'edit'){
                params.errorMessage = 'Error Updating Movie'
            }else{
                params.errorMessage = 'Error Creating Movie' 
            }
        }
        res.render(`movies/${form}`, params)
    }
    catch {
        res.redirect('/movies')
    }
}

//functionality for saving the cover image and its type 
function saveCover(movie, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        movie.coverImage = new Buffer.from(cover.data, 'base64') //storing cover in binary format
        movie.coverImageType = cover.type
    }
}


//functionality for checking whether user is authenticated
function checkAuthenticated(req,res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }

  
  //functionality for checking whether user is not authenticated
  function checkNotAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next ()
  }
  
//exporting the movie post router to server.js file
module.exports = router