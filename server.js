if(process.env.NODE_ENV != 'production'){
  require('dotenv').config()  
}
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path')
const passport = require('passport')
const flash = require('express-flash');
const session = require('express-session')

require('./passport-config')(passport)

var favicon = require('serve-favicon');

const indexRouter = require('./routes/index')
const directorRouter = require('./routes/directors')
const movieRouter = require('./routes/movies')
const userPostRouter = require('./routes/posts')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')));


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(bodyParser.urlencoded({limit : '10mb', extended : false }))
app.use(flash())
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:true,
  saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/',indexRouter)
app.use('/directors',directorRouter)
app.use('/movies',movieRouter)
app.use('/user',userPostRouter)


const mongoose  = require('mongoose')

mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser : true})
const db = mongoose.connection
db.on('error',error => console.error(error))
db.once('open',()=> console.log('Connected to Mongoose'))


app.listen(process.env.PORT || 3000)