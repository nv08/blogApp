const express = require('express')
const session = require('express-session')
const passport = require('passport')
const winston = require('winston')
const router = require('./routes/index')
const expressLayouts = require('express-ejs-layouts')
const flash = require('express-flash')
const {startServer,app} = require('./server')
const logger = require('./logConfiguration.js')


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(flash())
app.use(express.static(__dirname+'/views/'))
app.use(expressLayouts);
app.set('layout','mainLayout')
app.set('view engine','ejs')

app.use(session({
    secret : "Some weird animal",
    resave:false,
    saveUninitialized:true,
    cookie: { maxAge: 24*60*60*1000}
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(router)
startServer()





