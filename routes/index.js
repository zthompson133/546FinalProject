//Here you will require route files and export them as used in previous labs.
import theRoute from "./routes.js";
const constructorMethod = (app) => {
    app.use("/", theRoute);
    app.use("/signup", theRoute)
    app.use("/login", theRoute);
    app.use("/verify", theRoute);
    app.use('*', (req, res) => {
      res.status(404).json({error: 'Not found'});
    });
  };
  
export default constructorMethod;