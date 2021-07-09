const { PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const logger = ('./logConfiguration.js')

try{
        
    prisma.$connect()
    .then(
        module.exports = prisma
        
    )
    .catch(
        err=>
        {
            logger.error({
                level:'error',
                message:`connection to DB Failed`,
                
            })
            throw err
        })

    console.log("connection With DB established!!");
}

catch(err)
{
    console.log(err);
}
