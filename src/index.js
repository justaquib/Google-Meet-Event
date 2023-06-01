import express from "express";
import {google} from 'googleapis';
import dotenv from 'dotenv';
import axios from "axios";
import moment from "moment";
import {v4 as uuid} from "uuid";


dotenv.config({});

const app   = express();
const PORT  = process.env.APP_PORT || 8000;
const date  = new Date();

const calendar = google.calendar({
    version:"v3",
    auth: process.env.GOOGLE_CALENDER_API
})

const refresh_token = process.env.REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
)

const scopes = [
    'https://www.googleapis.com/auth/calendar',
];

app.get('/google', (req, res) =>{
    const url   =   oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    res.redirect(url);
})

app.get('/google/redirect',async (req, res) =>{
    const code      =   req.query.code;
    // console.log(oauth2Client) // log and get refresh token on the first request
    // const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials({refresh_token:refresh_token});
    
    res.send("it's working");
});

app.get('/schedule_event',async(req, res) => {

    await calendar.events.insert({
        calendarId:"primary",
        auth: oauth2Client,
        conferenceDataVersion:1,
        requestBody :{
            summary:   "Calendar Event Created With API",
            description: "Test event show that we have successfully created a calendar event using out API",
            start:{
                dateTime: new Date("2023-06-06"),
                timeZone: "Asia/Kolkata"
            },
            end:{
                dateTime: new Date("2023-06-07"),
                timeZone:"Asia/Kolkata"
            },
            conferenceData:{
                createRequest:{
                    requestId: uuid(),
                }
            },
            attendees:[
                {
                    email: "yourmailid@gmail.com",
                    email: "someone_else_mail_id@gmail.com"
                },
            ],
        },

    })
    // oauth2Client.getTokenInfo().then(info => info.email)

    res.send({
        msg:"You have successfully logged in"
    })
})

app.listen(PORT,() => {
    console.log("Server listening on port " + PORT);
    // console.log(moment(date).format("YYYY-MM-DD"))
})