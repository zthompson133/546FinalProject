import {users} from '../config/mongoCollections.js';
import {events} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import { getEventByID } from './events.js';
import { getUserByID } from './users.js';
import * as helpers from "./helpers.js";

export async function createFeedback(userId, eventId, rating, comment) {
    const user = await getUserByID(userId)
    const event = await getEventByID(eventId)

    if (!user) {
        throw `User with ID ${userId} does not exist`;
    }

    if (!event) {
        throw `Event with ID ${eventId} does not exist`;
    }

    const ratings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
    if (!ratings.includes(rating)) {
        throw "Not a valid rating";
    }

    const comment = helpers.checkString(comment, 'comment')

    const newFeedback = {
        _id: new ObjectId(),
        userId: user._id,
        eventId: event._id,
        rating: rating,
        comment: comment,
        createdAt: new Date()
    };

    const userCollection = await users();
    const eventCollection = await events();

    const userUpdate = await userCollection.updateOne(
        { _id: user._id },
        { $push: { feedback: newFeedback } }
    );

    if (userUpdate.matchedCount === 0) {
        throw `Could not add feedback to user with ID ${userId}`;
    }

    const eventUpdate = await eventCollection.updateOne(
        { _id: event._id },
        { $push: { feedback: newFeedback } }
    );

    if (eventUpdate.matchedCount === 0) {
        throw `Could not add feedback to event with ID ${eventId}`;
    }

    return await getEventByID(eventId);
}

export async function getFeedback(feedbackId) {
    feedbackId = helpers.checkString(feedbackId, 'feedbackId')
    if (!ObjectId.isValid(feedbackId)) {
      throw 'invalid object ID'
    } 
  
    const eventsCollection = await events();
    const foundFeedback = await eventsCollection.findOne(
      {'feedback._id': new ObjectId(feedbackId)},
    );
  
    if (!foundFeedback) {
      throw 'Feedback Not Found';
    }
  
    return foundFeedback.feedback[0];
};  

export async function updateFeedback(feedbackId, updateObject) {
    feedbackId = helpers.isValidString(feedbackId, 'feedbackId')

    if (!ObjectId.isValid(feedbackId)) {
        throw 'Invalid object ID';
    }

    let userId
    let eventId
    const userCollection = await users()
    const eventCollection = await events()
    const userList = await userCollection.find({}).toArray()
    const eventList = await eventCollection.find({}).toArray()

    let feedback = await getFeedback(feedbackId)

    for (const users of userList) {
        for (const feedback of users.feedback) {
            if (feedback._id.toString() === feedbackId) {
                userId = users._id
            }
        }
    }

    for (const events of eventList) {
        for (const feedback of events.feedback) {
            if (feedback._id.toString() === feedbackId) {
                eventId = events._id
            }
        }
    }
    
    const user = await getUserByID(userId.toString());
    const updatedFeedbackData = { ...feedback };

    const event = await getEventByID(eventId.toString());

    let newRating = event.rating

    if (updateObject.rating) {
        const ratings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
        if (!ratings.includes(updateObject.rating)) {
            throw "Not a valid rating";
        }

        updatedFeedbackData.rating = updateObject.rating

        newRating = (newRating * event.feedback.length - feedback.rating + updateObject.rating) / event.feedback.length
    }

    if (updateObject.comment) {
        const checkComment = helpers.checkString(updateObject.comment, 'comment')

        updatedFeedbackData.comment = checkComment
    }


    let updatedEventFeedbackArray = [];
    for (const feedback of event.feedback) {
        if (feedbackId === feedback.feedbackId.toString()) {
            updatedEventFeedbackArray.push({ ...updatedFeedbackData, _id: feedback._id });
        } else {
            updatedEventFeedbackArray.push(feedback);
        }
    }

    let updatedUserFeedbackArray = [];
    for (const feedback of user.feedback) {
        if (feedbackId === feedback.feedbackId.toString()) {
            updatedUserFeedbackArray.push({ ...updatedFeedbackData, _id: feedback._id });
        } else {
            updatedUserFeedbackArray.push(feedback);
        }
    }

    const eventUpdate = await eventCollection.updateOne(
    { _id: new ObjectId(event._id.toString())},
    { $set: { feedback: updatedEventFeedbackArray, rating: newRating }}
    );

    if (eventUpdate.modifiedCount === 0) {
        throw `Could not update the feedback with ID ${feedbackId}`;
    }

    const userUpdate = await userCollection.updateOne(
    { _id: new ObjectId(user._id.toString())},
    { $set: { feedback: updatedUserFeedbackArray }}
    );

    if (userUpdate.modifiedCount === 0) {
        throw `Could not update the feedback with ID ${feedbackId}`;
    }

    const updatedEvent = await getEventByID(event._id.toString())

    return updatedEvent;
};

export const removeGame = async (feedbackId) => {
    feedbackId = helpers.checkString(feedbackId, 'feedbackId')
    if (!ObjectId.isValid(feedbackId)) {
    throw 'invalid object ID'
    } 

    let userId
    let eventId
    const usersCollection = await users()
    const eventCollection = await events()
    const usersList = await usersCollection.find({}).toArray()
    const eventList = await eventCollection.find({}).toArray()

    let feedback = await getFeedback(feedbackId)

    for (const users of usersList) {
        for (const feedbacks of users.feedback) {
            if (feedbacks._id.toString() === feedbackId) {
                userId = users._id
            }
        }
    }

    for (const events of eventList) {
        for (const feedbacks of events.feedback) {
            if (feedbacks._id.toString() === feedbackId) {
                eventId = users._id
            }
        }
    }

    const user = await getUserByID(userId.toString());
    const event = await getEventByID(eventId.toString());

    let updatedUserFeedbackArray = [];
    for (const feedbacks of user.feedback) {
        if (feedbackId === feedbacks._id.toString()) {
            continue
        } else {
            updatedUserFeedbackArray.push(feedbacks);
        }
    }

    let updatedEventFeedbackArray = [];
    for (const feedbacks of event.feedback) {
        if (feedbackId === feedbacks._id.toString()) {
            continue
        } else {
            updatedEventFeedbackArray.push(feedbacks);
        }
    }

    const newRating = (event.rating * event.feedback.length - feedback.rating) / (event.feedback.length - 1)

    const userFeedbackUpdate = await usersCollection.updateOne(
        { _id: new ObjectId(user._id.toString())},
        { $set: { feedback: updatedUserFeedbackArray }}
    );

    const eventFeedbackUpdate = await eventCollection.updateOne(
        { _id: new ObjectId(event._id.toString())},
        { $set: { feedback: updatedEventFeedbackArray, rating: newRating }}
    );

    const updatedEvent = await getEventByID(event._id.toString())

    return updatedEvent;
}