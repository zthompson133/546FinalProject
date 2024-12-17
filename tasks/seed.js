import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import events from '../data/events.js';
import users from '../data/users.js';

const db = await dbConnection();
await db.dropDatabase();

const user1 = await users.addUser('Mark', 'Johnson', 'mjohnson@stevens.edu', 'Undergraduate', 'helloWorld/1', 'helloWorld/1');
const mid = user1._id.toString();

const user2 = await users.addUser('Sara', 'Miller', 'smiller@stevens.edu', 'Undergraduate', 'cs4All!', 'cs4All!');
const sid = await user2._id.toString();

const vUser = await users.addUser('Joseph', 'Walker', 'jwalker@stevens.edu', 'Undergraduate', 'eventOrg#2', 'eventOrg#2');
const vid = await vUser._id.toString();

const firstEvent = await events.addEvent(
  'Arts and Crafts', 'Join us for crafting and free food', '12/22/24', '6:00 pm', '8:00 pm', 'Babbio 104', 'Undergraduates',
  mid, sid, vid
);

const secondEvent = await events.addEvent(
  'Movie Night', 'Join us for a movie and free food', '12/20/24', '7:00 pm', '9:00 pm', 'McLean 104', 'Undergraduates',
  mid, sid, vid
);

console.log('Done seeding database');
await closeConnection();
