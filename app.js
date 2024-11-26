/*
Here is where you'll set up your server as shown in lecture code and worked in previous labs.
Your server this week should not do any of the processing or calculations.  Your server only exists to allow someone to get to the HTML Page and download the associated assets to run the Fibonacci & prime number checking page.
*/
import express from 'express';
import configRoutesFunction from './routes/index.js';
const app = express();
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
configRoutesFunction(app);
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
