const express = require('express')
const {MongoClient} = require("mongodb")
const UserRepository = require("./user-repository")
const bodyParser = require('body-parser')
const {ObjectId} = require('bson')

const app = express()
app.use(bodyParser.json())


let userRepository
let client
let connected = false
const user = process.env.ENV_MONGOOSE_USER 
const pass = process.env.ENV_MONGOOSE_PASS 
const database = process.env.ENV_MONGOOSE_DATABASE 
const serverName = process.env.ENV_MONGOOSE_SERVER

app.use( async (req, res, next) =>{
    if(!connected){
        const uri = 'mongodb+srv://'+user+':'+pass+'@'+serverName+'/'+database+'?retryWrites=true&w=majority'

        client = new MongoClient(uri)
        await client.connect()
        collection = client.db(database).collection('usuarios')
        userRepository = new UserRepository(collection)

        connected = true
    }

    next()
})

app.get('/users',async (request,response)=>{
    const users = await userRepository.findAll()
    response.status(200).json(users)
})
app.post('/users',async (request,response)=>{
    try{
        const userExists = await userRepository.findOneByEmail(request.body.email)
        if(userExists!= null){
            response.status(400).send('Email duplicado')
            
        }
    }catch (ex){
        if(ex.message === "Usuário não encontrado"){
            const user = await userRepository.insert(request.body)
            response.status(201).json(user)
        }else{
            response.status(400).send(ex.message)

        }
    }
})

app.get('/users/:id', async (request,response) => {
    

    try{
        const user = await userRepository.findOneById(ObjectId(request.params.id))
        response.status(200).json(user)

    }catch (ex){
        if(ex.message === "Usuário não encontrado"){
            response.status(404).send()
        }
    }
    
})

module.exports = app;