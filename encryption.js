const crypto = require('crypto')

function generatePass(password){
    try{
        if(password){

            salt = process.env.salt
            genHash = crypto.pbkdf2Sync(password,salt,10000,64,'sha512').toString('hex')
            return {salt,genHash}
        }
        else{

            throw new Error("password cannot be empty")
        }
    }
    catch(err)
    {
        throw err
    }

}

function validatePass(password,hash,salt){

    if(password && hash){

        verify = crypto.pbkdf2Sync(password,salt,10000,64,'sha512').toString('hex')
        return hash==verify
    }
    else{

        throw new Error("password Or hash cannot be empty")
    }

}

module.exports = {generatePass,validatePass}