/* eslint quote-props: "off" */
/* eslint no-console: "off" */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const low = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');
const shortid = require('shortid');

const config = require('./config.json');

// Start database using file-async storage
const db = low('db.json', {
  storage: fileAsync,
});

// Set some defaults if your JSON file is empty
db.defaults({
  urls: [],
}).write();

const host = config.host;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/list', (req, res) => {
  res.send(db.getState());
});

app.post('/api/shortener', (req, res) => {
  const targetUrl = req.body.url;
  if (!targetUrl || targetUrl.trim() === '') {
    res.send('empty url');
  } else {
    let shortUrl = '';
    const url = db.get('urls')
      .find({
        'target_url': targetUrl,
      })
      .value();
    // check if url already exists in database
    if (url && url.id) {
      // the url exists, so we return it without creating a new entry
      shortUrl = host + url.id;
    } else {
      // since it doesn't exist, let's go ahead and create it:
      const newId = shortid.generate();
      db.get('urls')
        .push({
          id: newId,
          target_url: targetUrl,
          visits: 0,
        })
        .write();
      shortUrl = host + newId;
    }
    res.send({
      short_url: shortUrl,
    });
  }
});

app.get('/:id', (req, res) => {
  const id = req.params.id;
  const url = db.get('urls').find({
    id,
  }).value();
  if (url && url.target_url) {
    const count = url.visits + 1;
    db.get('urls').find({
      id,
    }).assign({
      visits: count,
    }).write();
    res.redirect(url.target_url);
  } else {
    res.send(`error ${id} not found`);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
