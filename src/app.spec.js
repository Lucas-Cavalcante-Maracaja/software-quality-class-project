const request = require('supertest')
const app = require('./app')
const {MongoClient} = require("mongodb")
const UserRepository = require("./user-repository")
const user = process.env.ENV_MONGOOSE_USER
const pass = process.env.ENV_MONGOOSE_PASS
const database = process.env.ENV_MONGOOSE_DATABASE
const serverName = process.env.ENV_MONGOOSE_SERVER


describe("UserApi - teste de sistema",()=>{

    let userRepository;
    let collection
    let client

    beforeAll(async()=>{
        const uri = 'mongodb+srv://'+user+':'+pass+'@'+serverName+'/'+database+'?retryWrites=true&w=majority'

        client = new MongoClient(uri)
        await client.connect()
        collection = client.db(database).collection('usuarios')
        userRepository = new UserRepository(collection)
       
    })
    afterAll(async()=>{

        await client.close()
    })

    beforeEach(async()=>{
        await collection.deleteMany({})
    })
    afterEach(async()=>{
        await collection.deleteMany({})
    })
    describe("/users",()=>{
        describe("GET",()=>{

            test("Deve retornar uma lista vazia",async()=>{
                const response = await request(app).get('/users')
                expect(response.statusCode).toBe(200)
                expect(response.body).toStrictEqual([])
            })
            test("Deve retornar uma lista com 2 usuários",async()=>{
                await userRepository.insert({
                    nome: "Doe",
                    email: "john@doe.com"
                })

                await userRepository.insert({
                    nome: "Joe",
                    email: "joeDoe@don.com"
                })

                const response = await request(app).get('/users')
                expect(response.statusCode).toBe(200)
                expect(response.body[0]).toEqual(expect.objectContaining({
                    nome: "Doe",
                    email: "john@doe.com"
                }))

                expect(response.body[1]).toEqual(expect.objectContaining({
                    nome: "Joe",
                    email: "joeDoe@don.com"
                }))
                
            })
        })
        describe("POST",()=>{
            test("Deve incluir 1 usuario",async()=>{
                const response = await request(app).post('/users').send({
                    nome: "Doe",
                    email: "john@doe.com"
                })

                expect(response.statusCode).toBe(201)
            })
            test("Não deve incluir usuário com email duplicados",async()=>{

                await userRepository.insert({
                    nome: "Doe",
                    email: "john@doe.com"
                })

                const response = await request(app).post('/users').send({
                    nome: "Doe2",
                    email: "john@doe.com"
                })
                expect(response.statusCode).toBe(400)
            })
        })
    })

    describe("/users/:id",()=>{
        describe("GET",()=>{
            test("Deve retornar um usuario",async()=>{
                const user = await userRepository.insert({
                    nome: "Doe",
                    email: "john@doe.com"
                })
                const response = await request(app).get('/users/'+user._id)
                expect(response.statusCode).toBe(200)
                expect(response.body).toEqual(expect.objectContaining({
                    nome: "Doe",
                    email: "john@doe.com"
                }))
            })
            test("Deve retornar 404 quando não encontrar usuário",async()=>{
                
                const response = await request(app).get('/users/61a06c492d399952b235d8bd')
                expect(response.statusCode).toBe(404)
                
            })
        })
        describe("PUT",()=>{
            test.todo("Deve alterar o usuario")
            test.todo("Deve retornar 404 quando não encontrar usuário")
        })
        describe("DELETE",()=>{
            test.todo("Deve excluir o usuario")
            test.todo("Deve retornar 404 quando não encontrar usuário")
        })
    })
})