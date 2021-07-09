const router = require('express').Router()
const uuid = require('uuid').v4
const passport = require('passport')
const prisma = require('../createConnection')
const {generatePass} = require('../encryption')
require('../passport')

try{

router.get('/',async(req,res)=>{

    const post = await prisma.posts.findMany({
        include:{
            author:true
        },
        orderBy : {
            date : 'desc'
        }
    })
    
    res.render('welcomePage',{
        data : post,
        request:req
    })
})

router.get('/register',(req,res)=>{

    res.render('userRegisteration',{
        request:req
    })
})

router.post('/register',async(req,res)=>{

    const userEmail = req.body.email
    const userinDB = await prisma.cred.findFirst({
        where : {email : userEmail}
    })
    .catch(err=>{
        res.status(404)
        logger.error({
            level:'error',
            message:`${res.statusCode}: ${res.statusMessage}`,
            
        })
        req.flash('msg',"Please Try Again")
        res.redirect('/register')

    })
    
    if(userinDB) {
        
        req.flash('msg',"Email Already Exists!!");
        res.render('userRegisteration',{
            request:req
        })
    }
    
    else{
    
        saltHash = generatePass(req.body.pass)
        salt = saltHash.salt
        const user_id = uuid()
        hashPassword = saltHash.genHash
        
        authorAccount = false

        if(req.body.isAuthor==='on') {authorAccount=true}
        await prisma.cred.create({
        data:{

            id:user_id,
            session_id:req.sessionID,
            name:req.body.user,
            password:hashPassword,
            email:userEmail,
            is_author: authorAccount
        }
        
    })
    .catch(err=>{
        res.status(409).redirect('/register')
        logger.error({
            level:'error',
            message:`${res.statusCode}: ${res.statusMessage} Entry could not be made to DB`,
            
        })
        
        req.flash('msg',"Please Try Again")
        res.redirect('/register')
    })
    req.flash('msg','Registeration Successful!!')
    res.redirect('/login')
}
})

router.get('/login',(req,res)=>{
    res.render('loginPage',{request:req})
})


router.post('/login',passport.authenticate('local',
{failureRedirect:'/loginFailure',successRedirect:'/dashboard',failureFlash:true}))

router.get('/loginFailure',(req,res)=>{
    req.flash('msg','Invalid Credentials!! Try Again')
    res.render('loginPage',{request:req})
})

router.get('/dashboard',async(req,res)=>{
    
    if(req.isAuthenticated()){

        const post = await prisma.posts.findMany({
            include:{
                author:true
            },
            orderBy : {
                date : 'desc'
            }
        })
        .catch(err=>{
            res.status(404).redirect('/login')
            logger.error({
                level:'error',
                message:`${res.statusCode}: ${res.statusMessage} Posts not found`,
                
            })
            
            req.flash('msg',"Please Try Again")
            res.redirect('/dashboard')
        })
        
        if(req.user.is_author){
            res.render('adminDashboard',{
                data:post,
                name:req.user.name,
                request:req,
                
            })
        }
        else{
        
            res.render('userDashboard',{
                data : post,
                name:req.user.name,
                request:req
             })
        }
    }
    else{

        logger.warn({
            level:'warn',
            message:`Invalid dashboard request generated`,
            
        })
        res.status(401).render('failures',{
            name:false,
            data:'Unauthorized Access',
            request:req
        })
    }
})

router.get('/createPost',(req,res)=>{
    if(req.isAuthenticated() && req.user.is_author)
    {
        res.render('createPost',{
            request:req,
            name:req.user.name
        })
    }

    else{

        logger.warn({
            level:'warn',
            message:`Invalid createPost request generated`,
            
        })
        if(req.isAuthenticated()){

            res.status(401).render('failures',{
                name:req.user.name,
                data:'Unauthorized Access',
                request:req
            })
        }
        else{

            res.status(401).render('failures',{
                name:false,
                data:'Unauthorized Access',
                request:req
            })
        }
        
    }
})

router.post('/createPost',async(req,res)=>{
    if(req.isAuthenticated && req.user.is_author)
    {
        
        const author = await prisma.author.findFirst({
            where : {
                id : req.user.id
            }
        })
        .catch(err=>{
            res.status(409).redirect('/createPost')
            logger.error({
                level:'error',
                message:`${res.statusCode}: ${res.statusMessage} Finding author Failed`,
                
            })
            req.flash('msg',"Please Try Again")
            res.redirect('/createPost')
            
        })
        
        if(!author){
            await prisma.author.create({
                data:{
                    id : req.user.id,
                    author_name : req.user.name
                }
            })
            .catch(err=>{
                res.status(409).redirect('/createPost')
                logger.error({
                    level:'error',
                    message:`${res.statusCode}: ${res.statusMessage} Author not inserted in DB`,
                    
                })
                
                req.flash('msg',"Please Try Again")
                res.redirect('/createPost')
            })
        }
        
        await prisma.posts.create({
            data:{
                post_id : uuid(),
                title : req.body.title,
                content : req.body.content,
                date : new Date(Date.now()),
                author_id : req.user.id
            }
        })
        .catch(err=>{
            
            logger.error({
                level:'error',
                message:`${res.statusCode}: ${res.statusMessage} Post could not be created`,
                
            })
            
            req.flash('msg',"Please Try Again")
            res.status(409).redirect('/createPost')
        })

    }
    else{
        res.status(401).render('failures',{
            name:false,
            data:'Unauthorized Access',
            request:req
    })
}
    logger.info({
        level:'info',
        message:`+1 post created by ${req.user.name}`,
        
    })
    req.flash('msg',"Post Added Successfully!!!")
    res.redirect('/dashboard')
})


router.get('/post/:id',async(req,res)=>{
    
    const data = await prisma.posts.findFirst({
        include: {
            author:true
        },
        where : {
            post_id : req.params.id
        }
    })
    .catch(err=>{

        logger.error({
            level:'error',
            message:`error in finding post`,
            
        })
        if(req.user){
            res.status(404).redirect('/dashboard')
        }
        else{
            res.status(404).redirect('/')
        }
        
    })

    if(req.user)
    {
        res.render('singlePost',{
            singlePost : data,
            name:req.user.name,
            request:req
    
       })  
    }
    else{
        res.render('singlePost',{
            singlePost : data,
            name:false,
            request:req
        })
    }
})

router.get('/dashboard/postDelete/:id',async(req,res)=>{
    if(req.isAuthenticated && req.user.is_author){
        await prisma.posts.delete({
            where : {
                post_id : req.params.id
            }
        })
        .catch(err=>{
            res.status(404).redirect('/dashboard')
            logger.error({
                level:'error',
                message:`${res.statusCode}: ${res.statusMessage} Post could not be deleted`,
                
            })
            req.flash('msg',"Please Try Again")
            res.status(409).redirect('/dashboard')
            
        })
    }
    else{

        res.status(401).render('failures',{
            request:req,
            name:false,
            data:'Unauthorized Access!!'
            
        })
    }
    logger.info({
        level:'info',
        message:`-1 post deleted by ${req.user.name}`,
        
    })
    req.flash('msg',"Post Deleted Successfully")
    res.redirect('/dashboard')
})

router.get('/dashboard/postUpdate/:id',async(req,res)=>{
    if(req.isAuthenticated() && req.user.is_author){
        const result = await prisma.posts.findFirst({
            where : {
                post_id:req.params.id
            }
        })
        .catch(err=>{
            res.status(404).redirect('/dashboard')
            logger.error({
                level:'error',
                message:`${res.statusCode}: ${res.statusMessage} Post could not be found`,
                
            })
            
            req.flash('msg',"Please Try Again")
            res.status(409).redirect('/dashboard')
        })
        res.render('updatePost',{
            data:result,
            name:req.user.name,
            request:req
            
        })
        
    }
    else{

        res.status(401).render('failures',{
            require:req,
            name:false,
            data:'Unauthorized Access!!'

        })
    }
    
})

router.post('/dashboard/updatePost/:id',async(req,res)=>{
    if(req.isAuthenticated() && req.user.is_author)
    {
        await prisma.posts.update({
            where : {
                post_id : req.params.id
            },
            data:{
                title : req.body.title,
                content : req.body.content,
                last_updated_by: req.user.id,
                last_updated_time: new Date(Date.now())
            }
            
        })
        .catch(err=>{
            res.status(409).redirect('/dashboard')
            logger.error({
                level:'error',
                message:`${res.statusCode}: ${res.statusMessage} Post could not be Updated`,
                
            })
            req.flash('msg',"Please Try Again")
            res.status(409).redirect('/dashboard')
            
        })
    }
    else{

        res.status(401).render('failures',{
            request:req,
            name:false,
            data:'Unauthorized Access!!'

        })
    }

    logger.info({
        level:'info',
        message:`+1 post updated by ${req.user.name}`,
        
    })
    req.flash('msg',"Post Updated Successfully")
    res.redirect('/dashboard')
})

router.get('/filters',async(req,res)=>{
    const result = await prisma.posts.findMany({
        include:{
            author:true
        },
        where:{
            author : {
                author_name:{
                    contains:req.query.searchQueryAuthor 
                } || true
            },
            title : {
                contains : req.query.searchQueryKey
            }  || true ,
        },
        orderBy : {
            date : req.query.order || 'desc'
        }
    })
    .catch(err=>{

        logger.error({
            level:'error',
            message:`search by author failed`,
            
        })
        if(req.user){
            res.status(409).redirect('/dashboard')
        }
        else{
            res.status(409).redirect('/')
        }
        
        
    })

    if(req.isAuthenticated() && req.user)
    {
       
        if(req.user.is_author){
            res.render('adminDashboard',{
                data:result,
                name:req.user.name,
                request:req
            })
            
        }
        else{
            res.render('userDashboard',{
                data:result,
                name:req.user.name,
                request:req
            })
        }
    }
    
    else{
        res.render('welcomePage',{
            data : result,
            request:req
        })
        
    }
        
})

router.get('/all/authors',async(req,res)=>{
    const result = await prisma.author.findMany({
        select : {
            author_name : true
        }
    })
    res.json(result)
})



router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash('msg','Successfully Logged Out!!')
    res.render('loginPage',{request:req})
})
}
catch(err)
{
    logger.error({
        level:'error',
        message:err,
        
    })
}

router.get('/page',async(req,res)=>{
    const data = await prisma.posts.findMany({
        include:{
            author:true
        },
        skip:(req.query.number - 1)*5,
        take:5
    })

    res.render('partials/postBody',{
        data:data,
        request:req
    })
})

router.get('/total/page',async(req,res)=>{
    const pages = await prisma.posts.count()
    res.json(Math.ceil(pages/5))
})
module.exports = router