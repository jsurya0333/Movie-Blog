const express = require('express')
const app = express()
const router = express.Router()
const Movie = require('../models/movie')
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../models/user')



//getting recently added posts
router.get('/', checkAuthenticated, async (req, res) => {
  let movies
  try {
    movies = await Movie.find().sort({ createdAt: 'desc' }).limit(10).exec()
  }catch {
    movies = []
  }
  res.render('index.ejs', { movies: movies, users: req.user.name })
})



//routes for getting all my posts
router.get('/myPosts', checkAuthenticated, async (req, res) => {
  const user = req.user.id
  try {
    const movies = await Movie.find({ postedBy: user }).populate('director').exec()
    res.render('user/myposts', {
      movies: movies
    })
  } catch (e) {
    console.log(e)
    res.redirect('/movies')
  }

})

//login form route 
router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('users/login.ejs')
})


//route for user login and checking user is not authenticated
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

//route for user register form 
router.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('users/register.ejs')
})

//route for register and checking user is not authenticated yet
router.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const users = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    users.save();
    res.redirect('/login')
    console.log(users)
  } catch (e) {
    console.log(e)
    res.redirect('/register')
  }

})


//user logout route
router.delete('/logout', function (req, res, next) {
  req.logOut(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  })
})


//funtionality for checking whether the user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}


//functionality for checking whether the user is not authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

//exporting the index page router to server.js file
module.exports = router