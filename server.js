const express = require("express");
const neo4j = require("neo4j-driver");
const cors = require("cors");

const app = express();

app.use(cors());

const driver = neo4j.driver(
    "neo4j+s://8f53228e.databases.neo4j.io",
    neo4j.auth.basic("8f53228e", "oCCqLULb0D8pKLP4Z85t8QoTnrNLr1schnReDfHcEO0")
);

// =====================
// Danger Zones API
// =====================
app.get("/dangerzones", async (req, res) => {

    const session = driver.session({
        database: "8f53228e"
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

    } catch (err) {

        console.log(err);
        res.status(500).send("Error");

    } finally {

        await session.close();

    }

});

// =====================
// Routes API
// =====================
app.get("/routes", async (req, res) => {

    const session = driver.session({
        database: "8f53228e"
        
    });

    try {

        const result = await session.run(`
            MATCH (a:Location)-[r]->(b:Location)
            RETURN
                a.name AS from,
                b.name AS to,
                type(r) AS relation
        `);

        const routes = result.records.map(record => ({
            from: record.get("from"),
            to: record.get("to"),
            relation: record.get("relation")
        }));

        res.json(routes);

    } catch (err) {

        console.log(err);
        res.status(500).send("Error");

    } finally {

        await session.close();

    }

});
// =====================
// MAP DATA API
// =====================
app.get("/map", async (req, res) => {

    const session = driver.session({
        database: "8f53228e"
    
    });

    try {

        const result = await session.run(`
            MATCH (n:Location)
            RETURN
                n.name AS name,
                n.lat AS lat,
                n.lng AS lng,
                n.risk AS risk,
                n.incident AS incident
        `);

        const data = result.records.map(record => ({

            name: record.get("name"),
            lat: Number(record.get("lat")),
            lng: Number(record.get("lng")),
            risk: record.get("risk"),
            incident: record.get("incident")

        }));

        res.json(data);

    } catch (err) {

        console.log(err);
        res.status(500).send("Error");

    } finally {

        await session.close();

    }

});
// =====================
// Start Server
// =====================
app.listen(3000, () => {

    console.log("Server running on port 3000");

});