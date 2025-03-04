const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const cors = require('cors');
var db = require('text-db')('myDB-Text.db');


const app = express();
app.use(express.json());
const port = process.env.PORT || 2000;

// Twilio credentials
const accountSid = process.env.ACCSID;
const authToken = process.env.AUTHTOKEN;
const client = new twilio(accountSid, authToken);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Endpoint to send SMS
app.post('/send-sms', (req, res) => {
  const { to, body, from } = req.body;
  let data = db.getItem('SMS-DATA');
  if(data)
    data.push(req.body)
  else
  data = [req.body]

  client.messages
    .create({
      body: body,
      from: from,
      to: to
    })
    .then(message => { 
      db.setItem("SMS-DATA",data);
      res.json({ success: true, messageSid: message.sid }) })
    .catch(error => {
      db.put('sms-data', {
        body: body,
        from: from,
        to: to,
        status: "false"
      });
      res.json({ success: false, error })
    });
});
// Endpoint to receive SMS
app.post('/receive-sms', (req, res) => {
  const { From, Body } = req.body;
  // You can save the received SMS to a database or perform other actions here
  console.log(`Received SMS from ${From}: ${Body}`);

  db.on('open', function() {
  
   res.json(db.get('sms-data'))
});
});


// Endpoint to receive SMS
app.get('/sms-history', (req, res) => {
    res.json(db.getItem("SMS-DATA")	)

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
