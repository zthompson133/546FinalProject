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

    const newFeedback = {
        _id: new ObjectId(),
        userId: user._id,
        eventId: event._id,
        rating: rating,
        comments: comment,
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
    feedbackId = isValidString(feedbackId)
    if (!ObjectId.isValid(feedbackId)) {
      throw 'invalid object ID'
    } 
  
    const userCollection = await users();
    const foundGame = await userCollection.findOne(
      {'feedback._id': new ObjectId(feedbackId)},
    );
  
    if (!foundGame) {
      throw 'Game Not Found';
    }
  
    return foundGame.games[0];
};  

export async function updateFeedback(feedbackId, updateObject) {
    feedbackId = helpers.isValidString(feedbackId)

    if (!ObjectId.isValid(feedbackId)) {
        throw 'Invalid object ID';
    }

    let userId
    const userCollection = await users()
    const userList = await userCollection.find({}).toArray()

    let feedback = await getFeedback(feedbackId)

    for (const users of userList) {
        for (const feedback of users.feedback) {
            if (feedback._id.toString() === feedbackId) {
                userId = users._id
            }
        }
    }
    
    const user = await getUserByID(userId.toString());
    const updatedFeedbackData = { ...feedback };

    const event = await getEventByID(game.opposingTeamId.toString());

    if (updateObject.gameDate) {
    updatedGameData.gameDate = isValidDate(updateObject.gameDate);
    const gameYear = parseInt(updateObject.gameDate.substring(6, 10), 10);
    if (gameYear < team1.yearFounded || (team2 && gameYear < team2.yearFounded)) {
        throw "Game cannot occur before either team was founded";
    }
    }

    if (updateObject.homeOrAway) {
    if (updateObject.homeOrAway !== "Home" && updateObject.homeOrAway !== "Away") {
        throw "Indicate Home or Away";
    }
    updatedGameData.homeOrAway = updateObject.homeOrAway;
    }

    if (updateObject.finalScore) {
    isValidScore(updateObject.finalScore);
    updatedGameData.finalScore = updateObject.finalScore
    }

    if (updateObject.win !== undefined) {
    if (typeof updateObject.win !== 'boolean') {
        throw "Win can only be true or false";
    }
    updatedGameData.win = updateObject.win;

    let [wins, losses] = team1.winLossCount.split('-').map(Number);
    if (game.win !== updateObject.win) {
        if (updateObject.win) {
        wins += 1;
        losses -= 1;
        } else {
        wins -= 1;
        losses += 1;
        }
        newWinLoss = `${wins}-${losses}`;
    }
    }

    let updatedGamesArray = [];
    for (const game of team1.games) {
    if (gameId === game._id.toString()) {
        updatedGamesArray.push({ ...updatedGameData, _id: game._id });
    } else {
        updatedGamesArray.push(game);
    }
    }

    const teamGameUpdate = await teamsCollection.updateOne(
    { _id: new ObjectId(team1._id.toString())},
    { $set: { games: updatedGamesArray, winLossCount: newWinLoss }}
    );

    if (teamGameUpdate.modifiedCount === 0) {
    throw `Could not update the game with ID ${gameId}`;
    }

    const updatedTeam = await getTeamById(team1._id.toString())

    return updatedTeam;
};

export const removeGame = async (gameId) => {
    gameId = isValidString(gameId)
    if (!ObjectId.isValid(gameId)) {
    throw 'invalid object ID'
    } 

    let team1Id
    const teamsCollection = await teams()
    const teamsList = await teamsCollection.find({}).toArray()

    let game = await getGame(gameId)

    for (const teams of teamsList) {
    for (const games of teams.games) {
        if (games._id.toString() === gameId) {
        team1Id = teams._id
        }
    }
    }

    const team1 = await getTeamById(team1Id.toString());

    let updatedGamesArray = [];
    for (const game of team1.games) {
    if (gameId === game._id.toString()) {
        continue
    } else {
        updatedGamesArray.push(game);
    }
    }

    let [wins, losses] = team1.winLossCount.split('-').map(Number)
    if (game.win === true) {
    wins -= 1
    } else {
    losses -= 1
    }

    let newWinLoss = String(wins) + "-" + String(losses)

    const teamGameUpdate = await teamsCollection.updateOne(
    { _id: new ObjectId(team1._id.toString())},
    { $set: { games: updatedGamesArray, winLossCount: newWinLoss }}
    );

    const updatedTeam = await getTeamById(team1._id.toString())

    return updatedTeam;
}