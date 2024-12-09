import { Router } from 'express';
const router = Router();
import { eventData } from '../data/index.js';
import validation from '../validation.js';

router
  .route('/')
  .get(async (req, res) => {
    //retrieve a list of all events
    try {
      const eventList = await eventData.getAllEvents();
      return res.json(eventList);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })
  .post(async (req, res) => {
    //create a new event after validating inputs
    const eventData = req.body;
    //make sure there is something present in the req.body
    if (!eventData || Object.keys(eventData).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }
    //check all inputs, that should respond with a 400
    try {
      eventData.title = validation.checkString(eventData.title, 'Event Title');
      eventData.date = validation.checkString(eventData.date, 'Event Date');
      eventData.location = validation.checkString(eventData.location, 'Location');
      eventData.organizerId = validation.checkId(eventData.organizerId, 'Organizer ID');
    } catch (e) {
      return res.status(400).json({ error: e });
    }

    //insert the event
    try {
      const { title, date, location, organizerId } = eventData;
      const newEvent = await eventData.addEvent(title, date, location, organizerId);
      return res.json(newEvent);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  });

router
  .route('/:id')
  .get(async (req, res) => {
    //retrieve a specific event by ID
    //check inputs that produce 400 status
    try {
      req.params.id = validation.checkId(req.params.id, 'Event ID URL Param');
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try getting the event by ID
    try {
      const event = await eventData.getEventById(req.params.id);
      return res.json(event);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .put(async (req, res) => {
    //update an events details (all fields)
    const updatedData = req.body;
    //make sure there is something in the req.body
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }
    //check all the inputs that will return 400 if they fail
    try {
      req.params.id = validation.checkId(req.params.id, 'Event ID URL Param');
      updatedData.title = validation.checkString(updatedData.title, 'Event Title');
      updatedData.date = validation.checkString(updatedData.date, 'Event Date');
      updatedData.location = validation.checkString(updatedData.location, 'Location');
      updatedData.organizerId = validation.checkId(updatedData.organizerId, 'Organizer ID');
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try to update the event
    try {
      const updatedEvent = await eventData.updateEventPut(req.params.id, updatedData);
      return res.json(updatedEvent);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .patch(async (req, res) => {
    //update specific fields of an event (partially update)
    const requestBody = req.body;
    //check to make sure there is something in req.body
    if (!requestBody || Object.keys(requestBody).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }
    //check the inputs that will return 400 if fail
    try {
      req.params.id = validation.checkId(req.params.id, 'Event ID');
      if (requestBody.title)
        requestBody.title = validation.checkString(requestBody.title, 'Event Title');
      if (requestBody.date)
        requestBody.date = validation.checkString(requestBody.date, 'Event Date');
      if (requestBody.location)
        requestBody.location = validation.checkString(requestBody.location, 'Location');
      if (requestBody.organizerId)
        requestBody.organizerId = validation.checkId(requestBody.organizerId, 'Organizer ID');
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try to perform update
    try {
      const updatedEvent = await eventData.updateEventPatch(req.params.id, requestBody);
      return res.json(updatedEvent);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .delete(async (req, res) => {
    //delete an event by ID
    //check the id
    try {
      req.params.id = validation.checkId(req.params.id, 'Event ID URL Param');
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    //try to delete event
    try {
      const deletedEvent = await eventData.removeEvent(req.params.id);
      return res.json(deletedEvent);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

export default router;
