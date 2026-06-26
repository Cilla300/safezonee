const express = require("express");
const neo4j = require("neo4j-driver");
const cors = require("cors");

const app = express();

app.use(cors());

const driver = neo4j.driver(
    "neo4j://127.0.0.1:7687",
    neo4j.auth.basic("neo4j", "mnbvcxz123")
);

app.get("/dangerzones", async (req, res) => {

    const session = driver.session({
        database: "safezone"
    });

    try {

        const result = await session.run(
            "MATCH (n:Location) RETURN n"
        );

        const data = result.records.map((record, index) => {

    const node = record.get("n").properties;

    let lvl = "green";
    let r = 120;

    if (node.risk === "High") {
        lvl = "red";
        r = 180;
    } else if (node.risk === "Medium") {
        lvl = "orange";
        r = 150;
    }

    return {
        id: index + 1,
        lat: Number(node.lat),
        lng: Number(node.lng),
        lvl,
        r,
        label: node.incident
    };

});
        res.json(data);

    } catch(err){

        console.log(err);

    } finally{

        await session.close();

    }

});

app.listen(3000, () => {

    console.log("Server running on port 3000");

});