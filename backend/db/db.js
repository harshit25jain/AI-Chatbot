import mongoose from "mongoose";

function connect(){
    const mongoUrl = process.env.MONGO_URL;
    console.log("Mongo URL: ", mongoUrl); //check if the url in printed correctly

    mongoose.connect(mongoUrl)
    .then(() =>{
        console.log("Connected to DB");
    })
    .catch(err =>{
        console.log("Failed to connect to db: ",err);
    });
}
export default connect;