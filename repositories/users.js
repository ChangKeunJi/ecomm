const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const scrypt = util.promisify(crypto.scrypt);

const Repository = require('./repository');

class UsersRepository extends Repository {

    async create(attrs) {
        // attrs => {email : 'asdf', password: 'asdf'}

        attrs.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex');
        //: Random string

        const buffedHash = await scrypt(attrs.password,salt,64);
        //:returns buff

        const records = await this.getAll();
        const record = {
            ...attrs,
            password:`${buffedHash.toString('hex')}.${salt}`
        }

        records.push(record)

        await this.writeAll(records)

        return record;
    }

    async comparePasswords(saved,supplied) {
        // saved => password saved in out DB. "hashed.salt"
        // supplied => password given by sign in 

        const [hashed,salt] = saved.split('.');
        const hashedSupplied = await scrypt(supplied,salt,64);

        return hashed  === hashedSupplied.toString('hex');
    }  


}

module.exports = new UsersRepository('users.json');






/*

const test = async () => {
    const repo =  new UsersRepository('users.json');

    await repo.create({email:'test@test.com', password:'password'});

    const users = await repo.getAll();

    const users = await repo.getOne('3cdfd413');

    await repo.delete("dce6fa08");

    console.log(users);

    repo.update("3cdfd413", {password:"WOW!!"});

    const user = await repo.getOneBye({password:'pass'})

    console.log(user);
}

test();

*/