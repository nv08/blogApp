const express = require('express')
const app = express()
const logger = require('./logConfiguration')

function startServer({serverPort = process.env.SERVER_PORT}={}){

       try{

        app.listen(process.env.PORT,0.0.0.0)
    }
    catch(err)
    {
}

module.exports = {startServer,app}

