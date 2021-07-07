const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const prisma = require('./createConnection')
const {validatePass, generatePass} = require('./encryption')


const verify = async(user,pass,done)=>{
    
    const {salt,genHash} = generatePass(pass)
    const isValidPass = validatePass(pass,genHash,salt)
    
    const userMatch = await prisma.cred.findFirst({
        where : {email : user,password : genHash}
    })

    if(userMatch && isValidPass){
        return done(null,userMatch)
    }

    return done(null,false)
}

const customFields = {
    usernameField: 'email',
    passwordField: 'pass'
};

const strategy = new localStrategy(customFields,verify)

passport.serializeUser((user, done) => {
    
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
     
    prisma.cred.findUnique({
        where : { id : userId}
    }).then(user=>done(null,user))
});

passport.use(strategy)






