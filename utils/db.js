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
    return { id, email };
  }

  async addFile(file) {
    const filesCollection = await this.client.db().collection('files');
    const newFile = await filesCollection.insertOne(file);
    const modifiedData = newFile.ops
      .map(({ _id, localPath, ...rest }) => ({ id: _id, ...rest }))[0];
    return modifiedData;
  }

  async getFileById(id) {
    const filesCollection = await this.client.db().collection('files');
    const idObject = new ObjectID(id);
    return filesCollection.findOne({ _id: idObject });
  }

  async getFileByIdAndUserId(id, userId) {
    const filesCollection = await this.client.db().collection('files');
    const idObject = new ObjectID(id);
    const userIdObject = new ObjectID(userId);
    return filesCollection.findOne({ _id: idObject, userId: userIdObject });
  }

  async getPaginatedFiles(userId, parentId, page) {
    const filesCollection = await this.client.db().collection('files');
    const userIdObject = new ObjectID(userId);

    const pageSize = 20;
    const skip = page * pageSize;

    const matchStage = {
      userId: userIdObject,
    };

    if (parentId) {
      matchStage.parentId = parentId;
    }

    const pipeline = [
      {
        $match: matchStage,
      },
      { $skip: skip },
      { $limit: pageSize },
    ];

    return filesCollection.aggregate(pipeline).toArray();
  }

  async updateFileIsPublic(id, userId, state) {
    const filesCollection = await this.client.db().collection('files');
    const idObject = new ObjectID(id);
    const userIdObject = new ObjectID(userId);

    const updatedFile = await filesCollection.findOneAndUpdate(
      { _id: idObject, userId: userIdObject },
      { $set: { isPublic: state } },
      { returnDocument: 'after' },
    );

    return updatedFile.value;
  }
}

const dbClient = new DBClient();
export default dbClient;
