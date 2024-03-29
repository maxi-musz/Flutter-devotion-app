import express from "express";
import axios from "axios";
import cors from "cors";

import * as cheerio from 'cheerio';

const app = express();
const port = process.env.PORT || 3000;

var corsOptions = {
    origin: '*',
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    httpOnly: true,
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Body parse 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const today = new Date()

const day = String(today.getDate()).padStart(2, '0');
const devotionDay = parseInt(day) - 1;

app.get("/", (req, res) => {

    res.send("Daily devotion API is running");
})

app.get("/today", (req, res) => {

    console.log(`Today's date is ${day}`)

    const day = String(today.getDate()).padStart(2, '0');
    const devotionDay = parseInt(day) - 1;

    console.log(`Today's devotion day is for URL is ${devotionDay}`);
    res.send(`Today's date is ${day}. Today's devotion day for URL is ${devotionDay}`)
})

const URL = `https://www.openheavensdaily.com/2024/03/open-heaven-for-today-2024-open-heavens_${devotionDay}.html`;

const response = await axios.get(URL); // Make the HTTP request

        let $ = cheerio.load(response.data);
        
        // Extract TOPIC
        const pTagTopic = $('p');
        const textContentTopic = pTagTopic.text();
        const regexTopic = /TOPIC:\s*(.*?)\s*(?=[A-Z]+:|$)/;
        const matchTopic = textContentTopic.match(regexTopic);
        const topic = matchTopic ? matchTopic[1].trim() : null;;
        // const topic = $('p').text().match(/"(.*?)"/)[1]; // Extract the topic ("Thou shalt not steal")

        // Extract PASSAGE
        const memoriseElement = $('#Blog1 > div > div.blog-post.hentry.item-post > div.post-body.post-content > p:nth-child(4) > span');
        let memoriseText = memoriseElement.text();
        memoriseText = memoriseText.replace(/^MEMORISE:-/, '');
        memoriseText = memoriseText.replace(/\\/g, '').replace(/'/g, '');

        // Extract READ
        const readElement = $('#Blog1 > div > div.blog-post.hentry.item-post > div.post-body.post-content > p:nth-child(5) > span');
        let read = readElement.text();
        read = read.replace(/^READ: /, '').replace(/"$/, '');

        // Extract BODY
        const postContent = $('#Blog1 > div > div.blog-post.hentry.item-post > div.post-body.post-content');
        let body = '';
        const pTagsBody = postContent.find('p');
        for (let i = 3; i < pTagsBody.length; i++) {
            // Extract the text content of each <p> tag and concatenate it to the 'body' variable
            body += $(pTagsBody[i]).text().trim() + '\n';
        }


        // Create an object containing the topic and passage
        const responseData = {
            success: true,
            message: "Data retrieved successfully",
            data: {
                date: new Date(),
                topic,
                memorise: memoriseText,
                Read: read,
                body
            }
        };
        // Log the extracted values
        console.log(".........")
        console.log(responseData);

        // Send the response data to the client
        // res.json(responseData);

app.get("/todays-devotion", async (req, res) => {
    
    
    try {

        const result = responseData
        res.json(result);
         
    } catch (error) {
        console.error(error); // Log any errors
        res.status(500).send(error.message); // Send an error response to the client
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})