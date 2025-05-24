const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// store user data temporarily in memory (reset on server restart)
const users = {};

app.post('/webhook', (req, res) => {
    const twiml = new MessagingResponse();

    const from = req.body.From;
    const msg = req.body.Body.trim().toLowerCase();

    if (!users[from]) {
        users[from] = { step: 0, data: {} }
    }

    const user = users[from];

    const steps = [
        'Please enter your first name:',
        'Now enter your surname:',
        'Your email address:',
        'Phone number:',
        'Thanks! We’ll send this to the admin.'
    ];

    if (msg === 'start') {
        user.step = 0;
        user.data = {};
        twiml.message('👋 Hello! Let’s get started.\n' + steps[0]);
    } else {
        switch (user.step) {
            case 0:
                user.data.firstName = req.body.Body;
                twiml.message(steps[1]);
                user.step++;
                break;
            case 1:
                user.data.surname = req.body.Body;
                twiml.message(steps[2]);
                user.step++;
                break;
            case 2:
                user.data.email = req.body.Body;
                twiml.message(steps[3]);
                user.step++;
                break;
            case 3:
                user.data.phone = req.body.Body;
                // Here we pretend to send to admin (you can log or email it)
                console.log('🧾 New submission from WhatsApp:', user.data);
                twiml.message(steps[4]);
                user.step++;
                break;
            default:
                twiml.message('Type "start" to begin again.');
        }
    }

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
});

app.listen(8080, () => {
    console.log('🚀 Bot server is running on http://localhost:8080');
});
