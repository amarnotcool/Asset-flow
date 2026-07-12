import {setServers} from "dns";
setServers(["8.8.8.8","1.1.1.1"]);

import { configDotenv } from "dotenv";
configDotenv();

import { app } from "./src/app.js";

app.listen(process.env.PORT || 5000, ()=>{
  console.log(`Server started at port ${process.env.PORT || 5000}`)
})