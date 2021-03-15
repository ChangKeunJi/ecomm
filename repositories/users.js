const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
    constructor(filename) {
     
        //! 만약 매개변수가 없다면 THROW ERROR
        if(!filename) throw new Error ('NO FILE EXISTS');

        this.filename = filename;

        //! file이 존재하는지 확인한다. 
        // - accessSync를 사용하는 이유.
        // 1. 딱 한번만 인스턴스를 생성한다. ( 자주사용 x)
        // 2. constructor는 async 설정할 수 없다. 

        try {
            fs.accessSync(this.filename);

        } catch(err) {
            // 만약 파일이 존재하지 않는다면 새로 만든다. 
            fs.writeFileSync(this.filename,"[]");

        }
    }

    // Get a list of all users. JSON => JS
    async getAll() {
        return JSON.parse(await fs.promises.readFile(this.filename, {encoding:'utf8'}))
    }

    async create(attrs) {
        // {email : 'asdf', password: 'asdf'}

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
    async writeAll(records) {
        // Write the updated 'records' array back to this.filename
        await fs.promises.writeFile(this.filename, JSON.stringify(records,null,2));
    }

    randomId() {
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id) {
        const records = await this.getAll();
        return records.find(records => records.id === id);
    }

    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);

        await this.writeAll(filteredRecords)

    }

    async update(id,attrs) {
        const records = await this.getAll();
        const record = records.find(record => record.id === id);

        if(!record) {
            throw new Error(`Record with id ${id} not found`);
        }

        Object.assign(record,attrs);  

        await this.writeAll(records);
    }


    async getOneBye(filters) {

        const records = await this.getAll();

        for (let record of records) {
            let found = true;

            for (let key in filters) {
                if(record[key] !== filters[key]) {
                    found = false;
                }
            }

            if(found) {
                return record;
            }
        }

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