require('dotenv').config()
const {generatePass,validatePass} = require('./encryption')
const {startServer} = require('./server')



test("checking if salt for encryption is valid",()=>{
    const dummyPassword = "123"
    expect(generatePass(dummyPassword).salt).toBe(process.env.salt)
})

test("checking if password provided for encryption is null in generatePassword()",()=>{
    const dummyPassword = null
    expect(()=>generatePass(dummyPassword).salt).toThrow("password cannot be empty")
})

test("checking if password/hash provided for encryption is null in validatePassword()",()=>{
    const dummyhash = null
    const dummyPassword = "123"
    const fakeSalt = "bhjasgx67TAXgascksbc78"
    expect(()=>validatePass(dummyPassword,dummyhash,salt).toThrow("password Or hash cannot be empty"))
})

test("checking if generate and validate hashing working correctly",()=>{
    
    const dummyPassword = "1234"
    const hash = generatePass(dummyPassword).genHash
    expect(validatePass(dummyPassword,hash,process.env.salt)).toBe(true)
})

test(" starting server with null port",()=>{

    const port = null
    expect(()=>startServer(port)).toThrow("Cannot read property 'serverPort' of null")
})

