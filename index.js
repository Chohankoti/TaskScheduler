const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());


/*
{
    "date": "2024-02-23",
    "numberOfReminders": 5,
    "timeGap": 5,
    "timeUnit": "seconds"
}
*/


async function getRandomJoke() {
    try {
        const response = await axios.get('https://api.chucknorris.io/jokes/random');
        return response.data.value;
    } catch (error) {
        console.error('Error fetching joke:', error.message);
        return 'Error: Failed to fetch joke';
    }
}


function appendJokeToFile(joke) {
    const currentTime = new Date().toISOString();
    const filePath = path.join(__dirname, 'jokes.txt');
    const content = `${currentTime}: ${joke}\n`;

    fs.appendFile(filePath, content, (err) => {
        if (err) {
            console.error('Error appending joke to file:', err);
        } else {
            console.log('Joke appended to file');
        }
    });
}


function scheduleReminder(date, numberOfReminders, timeGap, timeUnit) {
    const eventDate = new Date(date);
    let frequency;

    switch (timeUnit) {
        case 'seconds':
            frequency = `*/${timeGap} * * * * *`; // Every 'timeGap' seconds
            break;
        case 'minutes':
            frequency = `0 */${timeGap} * * * *`; // Every 'timeGap' minutes
            break;
        case 'hours':
            frequency = `0 0 */${timeGap} * * *`; // Every 'timeGap' hours
            break;
        default:
            frequency = '0 */1 * * * *'; // Default: Every minute
    }

    let remindersTriggered = 0;
    const job = cron.schedule(frequency, async () => {
        if (remindersTriggered < numberOfReminders) {
            const joke = await getRandomJoke();
            console.log(`Reminder: Event at ${eventDate}. Joke: ${joke}`);
            appendJokeToFile(joke);
            remindersTriggered++;

            if (remindersTriggered === numberOfReminders) {
                job.stop(); 
            }
        }
    });
}

app.post('/schedule', (req, res) => {
    const { date, numberOfReminders, timeGap, timeUnit } = req.body;
    scheduleReminder(date, numberOfReminders, timeGap, timeUnit);
    res.send('Reminders scheduled successfully');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
