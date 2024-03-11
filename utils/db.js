import mongodb, { ObjectId } from 'mongodb';

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
    const objectId = ObjectId(id);
    const user = await usersCollection.findOne({ _id: objectId });
    const { email } = user;
    return { id, email };
  }

  async addFile(file) {
    const filesCollection = await this.client.db().collection('files');
    const newFile = await filesCollection.insertOne(file);

    return newFile;
  }

  async getFileById(id) {
    const filesCollection = await this.client.db().collection('files');
    const idObject = ObjectId(id);
    return filesCollection.findOne({ _id: idObject });
  }

  async getFileByIdAndUserId(id, userId) {
    const filesCollection = await this.client.db().collection('files');
    const idObject = ObjectId(id);
    const userIdObject = ObjectId(userId);
    return filesCollection.findOne({ _id: idObject, userId: userIdObject });
  }

  async getPaginatedFiles(userId, parentId, page) {
    const filesCollection = await this.client.db().collection('files');
    const userIdObject = ObjectId(userId);
    const parentIdObject = parentId !== '0'  ? ObjectId(parentId) : '0';

    const pageSize = 20;
    const skip = page * pageSize;

    const matchStage = {
      userId: userIdObject,
      parentId: parentIdObject,
    };

    // if (parentIdObject) {
    //   matchStage.parentId = parentIdObject;
    // }

    const pipeline = [
      {
        $match: matchStage,
      },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ];

    return filesCollection.aggregate(pipeline).toArray();
  }

  async updateFileIsPublic(id, userId, state) {
    const filesCollection = await this.client.db().collection('files');
    const idObject = ObjectId(id);
    const userIdObject = ObjectId(userId);

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
