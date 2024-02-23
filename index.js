const fs = require('fs');
const path = require('path');
const axios = require('axios');


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


function scheduleReminder(date, frequencyInSeconds) {
    const cronExpression = `*/${frequencyInSeconds} * * * * *`;

    cron.schedule(cronExpression, async () => {
        const joke = await getRandomJoke();
        console.log(`Reminder: Event at ${date}. Joke: ${joke}`);
        appendJokeToFile(joke);
    });
}
