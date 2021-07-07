const express = require('express')
const app = express()
const logger = require('./logConfiguration')

function startServer(){

    try{
        
        app.listen(process.env.PORT,0.0.0.0)
    }
    catch(err)
    {
        throw err
    }
}

module.exports = {startServer,app}

