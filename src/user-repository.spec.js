
const {MongoClient} = require("mongodb")
const UserRepository = require("./user-repository")
const user = process.env.ENV_MONGOOSE_USER
const pass = process.env.ENV_MONGOOSE_PASS
const database = process.env.ENV_MONGOOSE_DATABASE
const serverName = process.env.ENV_MONGOOSE_SERVER

describe("UserRepository - Teste de Integração",() =>{

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
    describe('findOneByEmail',() =>{
        test('Deve retornar o usuário john@doe.com', async ()=>{
            const result = await collection.insertOne({
                nome: "Doe",
                email: "john@doe.com"
            })

            const user = await userRepository.findOneByEmail('john@doe.com')

            expect(user).toStrictEqual({
                _id:result.insertedId,
                nome: "Doe",
                email: "john@doe.com"
            })
        })
        test('Deve lançar uma exceção para usuário não existente',async ()=>{


            await expect(userRepository.findOneByEmail('john@doe.com'))
                .rejects.toThrow("Usuário não encontrado")
        })

    })

    describe('insert', () =>{
        test('Inserir novo usuário',async()=>{
            const result = await userRepository.insert({
                nome: "Doe",
                email: "john@doe.com"
            })

            const user = await userRepository.findOneByEmail('john@doe.com')

            expect(user).toStrictEqual(result)
        })        
    })
    describe('update', () =>{
        test('Deve alterar usuário existente',async ()=>{
            const ogUser = await userRepository.insert({
                nome: "Doe",
                email: "john@doe.com"
            })

            const result = await userRepository.update(ogUser._id,{nome:"John", email:"DoeJohn@john.con"})

            const newuser = await userRepository.findOneByEmail('DoeJohn@john.con')

            expect(newuser).toStrictEqual({
                _id:ogUser._id,
                nome: "John",
                email: "DoeJohn@john.con"
            })
        }) 
        test('Deve lançar uma exceção para usuário não existente',async ()=>{
             

             await expect(userRepository.update("0",{nome:"John", email:"DoeJohn@john.con"}))
             .rejects.toThrow("Não foi possivel alterar")
        })       
    })
    describe('delete', () =>{
        test('Deve excluir usuário existente', async ()=>{
            const user = await userRepository.insert({
                nome: "Doe",
                email: "john@doe.com"
            })

            await userRepository.delete(user._id)

            await expect(userRepository.findOneByEmail('john@doe.com'))
                .rejects.toThrow("Usuário não encontrado")
        }) 
        test('Deve lançar uma exceção para usuário não existente',async()=>{
            await expect(userRepository.delete("0"))
                .rejects.toThrow("Não foi possivel excluir")
        })             
    })
    describe('findAll', () =>{
        test('Deve retornar lista vazia',async ()=>{
            const result = await userRepository.findAll()
           await expect(result)
           .toStrictEqual([])
        }) 
        test('Deve retornar lista com 2 usuários',async ()=>{
            const user1 = await userRepository.insert({
                nome: "Doe",
                email: "john@doe.com"
            })

            const user2 = await userRepository.insert({
                nome:"John", 
                email:"DoeJohn@john.con"
            })

            const result = await userRepository.findAll()
            await expect(result)
            .toEqual(expect.arrayContaining([
                {
                    _id:user2._id,
                    nome:"John", 
                    email:"DoeJohn@john.con"
                   
                },
                {
                    _id:user1._id,
                    nome: "Doe",
                    email: "john@doe.com"
                }]))
        })             
    })
})