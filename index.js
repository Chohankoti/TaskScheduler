const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());


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
    const eventDate = new Date(date).getTime();
    let frequencyInSeconds;

    switch (timeUnit) {
        case 'seconds':
            frequencyInSeconds = timeGap;
            break;
        case 'minutes':
            frequencyInSeconds = timeGap * 60;
            break;
        case 'hours':
            frequencyInSeconds = timeGap * 3600;
            break;
        default:
            frequencyInSeconds = 60; // Default to 1 minute
    }

    for (let i = 0; i < numberOfReminders; i++) {
        const reminderTime = eventDate + (frequencyInSeconds * 1000 * (i + 1));
        const reminderDate = new Date(reminderTime);
        cron.schedule(`${reminderDate.getSeconds()} ${reminderDate.getMinutes()} ${reminderDate.getHours()} ${reminderDate.getDate()} * *`, async () => {
            const joke = await getRandomJoke();
            console.log(`Reminder: Event at ${new Date(eventDate)}. Joke: ${joke}`);
            appendJokeToFile(joke);
        });
    }
}





app.post('/schedule', (req, res) => {
    const { date, numberOfReminders, timeGap, timeUnit } = req.body;
    scheduleReminder(date, numberOfReminders, timeGap, timeUnit);
    res.send('Reminders scheduled successfully');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
