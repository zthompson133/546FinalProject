import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import * as event from '../data/events.js';
import * as user from '../data/users.js';
import {users} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";

const db = await dbConnection();
await db.dropDatabase();

const userCollection = await users();

const user1 = await user.addUser('Mark', 'Johnson', 'mjohnson@stevens.edu', 'undergraduate', 'helloWorld/1', 'helloWorld/1');

const userUpdate1 = await userCollection.updateOne(
    { _id: new ObjectId(user1._id.toString()) },
    { $set: { verified: true, emailVerified: true } }
);

const mid = await user.getUserById(user1._id.toString());
const midEmail = mid.email

const user2 = await user.addUser('Sara', 'Miller', 'smiller@stevens.edu', 'undergraduate', 'cs4All!!', 'cs4All!!');

const userUpdate2 = await userCollection.updateOne(
  { _id: new ObjectId(user2._id.toString()) },
  { $set: { emailVerified: true } }
);

const sid = await user.getUserById(user2._id.toString());

const user3 = await user.addUser('Joseph', 'Walker', 'jwalker@stevens.edu', 'undergraduate', 'eventOrg#2', 'eventOrg#2');

const userUpdate3 = await userCollection.updateOne(
  { _id: new ObjectId(user3._id.toString()) },
  { $set: { emailVerified: true } }
);

const vid = user.getUserById(user3._id.toString());

const firstEvent = await event.addEvent(
  'Arts and Crafts', 'Join us for crafting and free food', '2024-22-12', '6:00', '8:00', 'Babbio 104', midEmail, 'undergraduate'
);

const secondEvent = await event.addEvent(
  'Movie Night', 'Join us for a movie and free food', '2024-20-12', '17:00', '19:00', 'McLean 104', midEmail, 'graduate',
);

console.log('Done seeding database');
await closeConnection();
