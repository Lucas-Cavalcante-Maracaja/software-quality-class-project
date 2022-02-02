module.exports = class UserRepository{
    constructor(collection){
        this.collection =collection
    }
    async findOneByEmail(email){
        const user = await this.collection.findOne({email})
        if(user===null)
            throw new Error("Usuário não encontrado")
        return user
    }
    async insert (user){
        await this.collection.insertOne(user)
        return user
    }

    async delete(id){
        const result = await this.collection.deleteOne({_id:id})

        if(result.deletedCount==0)
            throw new Error("Não foi possivel excluir")

    }

    async update(id,user){
        const result = await this.collection.updateOne({_id:id}, {$set:user})
        if(result.modifiedCount==0)
            throw new Error("Não foi possivel alterar")
    }

    async findAll(){
        const findResult = await this.collection.find({}).toArray();
        return findResult
    }
}