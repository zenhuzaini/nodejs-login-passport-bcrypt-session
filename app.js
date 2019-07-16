const express = require('express')
require('dotenv/config')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

//just in memeory var to save information
const users = []

app.set('view-engine', 'ejs')
//access all of the variables in the form in the express
app.use(express.urlencoded({ extended: false }))

//flash and session
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

//passport
app.use(passport.initialize())
app.use(passport.session())

//override middleware
app.use(methodOverride('_method'))

app.get('/', checkAuntheticated, (req, res) => {
    res.render('index.ejs',
        {
            name: req.user.name,
            email: req.user.email,
            id: req.user.id,
            password: req.user.password
        }) //req.user nme from passport
})

app.get('/register', checkNotAuntheticated, async (req, res) => {
    res.render('register.ejs')
})

app.get('/login', checkNotAuntheticated, async (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuntheticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuntheticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10) //10 tingkat hash/security
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (error) {
        res.redirect('/register')
    }
    console.log(users)

})

app.delete('/logout', (req, res) => {
    req.logOut() //function from passport
    res.redirect('/login')
})

//cek autentikasi kalau ada yang belum login 
function checkAuntheticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}


//is user authenticated for login and register page
function checkNotAuntheticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

const port = process.env.PORT
app.listen(port, function () {
    console.log(`this app is now running in port ${port}`)
})