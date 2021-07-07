const express = require('express')
const app = express()
const logger = require('./logConfiguration')

function startServer(){

    try{
        
        app.listen(process.env.PORT,()=>
        {
            console.log('started')
        })
    }
    catch(err)
    {
        throw err
    }
}

module.exports = {startServer,app}

