const express = require('express')
const app = express()
const logger = require('./logConfiguration')

function startServer({serverPort = process.env.SERVER_PORT}={}){

    try{
        
        app.listen(process.env.PORT,'0.0.0.0',()=>
        {
            logger.info({
                level:'info',
                message:`Server is being initialized on ${process.env.PORT}`,
                
            })
            console.log(`Server is being Initialized on ${serverPort}!`)
            console.log(`Server Started on ${serverPort}`);
        })
    }
    catch(err)
    {
        throw err
    }
}

module.exports = {startServer,app}

