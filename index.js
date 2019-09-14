require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const revai = require('revai-node-sdk');
const fs = require('fs');

const app = express();

const port = 8000;

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, () => {
	console.log("Listening on port " + port);
});

