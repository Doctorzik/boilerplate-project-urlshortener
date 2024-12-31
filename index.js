require("dotenv").config();
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint

const urlDatabase = [];

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
   //console.log(originalUrl);  
  try {
    const urlObject = new URL(originalUrl);
    console.log(urlObject);
    const hostname = urlObject.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Check if URL already exists in the database
        const existingEntry = urlDatabase.find(entry => entry.original_url === originalUrl);
        if (existingEntry) {
          return res.json({
            original_url: existingEntry.original_url,
            short_url: existingEntry.short_url,
          });
        }

        // Create a new short URL entry
        const shortUrl = urlDatabase.length + 1; // Incremental ID
        urlDatabase.push({
          original_url: originalUrl,
          short_url: shortUrl,
        });

        return res.json({
          original_url: originalUrl,
          short_url: shortUrl,
        });
      }
    });
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const foundEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (!foundEntry) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  return res.redirect(foundEntry.original_url);
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
