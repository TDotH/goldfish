const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./Database.js');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 5000;

//Serve static files from the React app
app.use(express.static(path.join(__dirname, '/../client/build')));
app.use(cors());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/../client/build/index.html'));
});

app.get('/tasks', async (req, res) => {
    try {
        const table = await db.pullTable();
        res.send(table);
    } catch (err) {
        res.send("Error " + err);
    }
});

app.get('/close', async (req, res) => {
    try {
        await db.closeDB();
    } catch (err) {
        res.send("Error " + err);
    }
})

app.listen(port, () => {
    console.log(`Server running at port:${port}`);
});



