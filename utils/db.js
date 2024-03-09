import mongodb, { ObjectID } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const dbName = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}/${dbName}`;

    this.client = new mongodb.MongoClient(url, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const usersCollection = await this.client.db().collection('users');
    return usersCollection.countDocuments();
  }

  async nbFiles() {
    const filesCollection = this.client.db().collection('files');
    return filesCollection.countDocuments();
  }

  async addUser(user) {
    const usersCollection = await this.client.db().collection('users');
    return usersCollection.insertOne(user);
  }

  async getUserByEmail(email) {
    const usersCollection = await this.client.db().collection('users');
    return usersCollection.findOne({ email });
  }

  async getUserById(id) {
    const usersCollection = await this.client.db().collection('users');
    const objectId = new ObjectID(id);
    const user = await usersCollection.findOne({ _id: objectId });
    const { email } = user;
    return { _id: id, email };
  }
}

const dbClient = new DBClient();
export default dbClient;
