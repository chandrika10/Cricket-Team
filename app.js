const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DBError:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Get cricketTeam API
app.get("/players/", async (request, response) => {
  const getCricketTeamQuery = `
       SELECT *
       FROM cricket_team
    `;
  const cricketTeamArray = await db.all(getCricketTeamQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  response.send(
    cricketTeamArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Add player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPayerQuery = `
           INSERT INTO
                cricket_team (
               player_name,
                jersey_number,
                   role)
            VALUES 
               ('${playerName}',
                ${jerseyNumber},
             '${role}')
                         
             `;
  const dbResponse = await db.run(addPayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Get PlayerId API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerId = `
       SELECT *
       FROM cricket_team
       WHERE player_id = ${playerId}
    `;
  const playerDetails = await db.all(getPlayerId);

  response.send(
    playerDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//update player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePayerQuery = `
           UPDATE
                cricket_team
           SET
                player_name = '${playerName}',
                jersey_number = ${jerseyNumber},
                    role = '${role}'
            WHERE player_id = ${playerId}`;
  const dbResponse = await db.run(updatePayerQuery);
  response.send("Player Details Updated");
});

//Delete player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
                               DELETE FROM cricket_team
                               WHERE player_id = ${playerId}`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
