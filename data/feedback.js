import {users} from '../config/mongoCollections.js';
import {events} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import { getEventByID } from './events.js';
import { getUserByID } from './users.js';
import * as helpers from "./helpers.js";

export async function createFeedback(userId, eventId, rating, comment) {
    const eventId = getEventByID(eventId)
    const userId = getUserByID(userId)

    const ratings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    if (!ratings.includes(rating)) {
        throw "Not a valid rating"
    }

    let newFeedback = {
        _id: new ObjectId(),
        userId: new ObjectId(userId),
        eventId: new ObjectId(eventId),
        rating: rating,
        comments: comment,
    }

    const userCollection = await users()
    const eventCollection = await events()

    const userUpdate = await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { feedback: newFeedback } }
    );

    if (userUpdate.matchedCount === 0) {
        throw `Can not add feedback to event`;
    }

    const eventUpdate = await eventCollection.updateOne(
        { _id: new ObjectId(eventId) },
        { $push: { feedback: newFeedback } }
    );

    if (eventUpdate.matchedCount === 0) {
        throw `Can not add feedback to event`;
    }
}
