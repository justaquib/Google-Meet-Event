import express from "express";
import {google} from 'googleapis';
import dotenv from 'dotenv';
import axios from "axios";
import moment from "moment";
import {v4 as uuid} from "uuid";


dotenv.config({});

const app   = express();
const PORT  = process.env.APP_PORT || 8000;
const startTime = moment().set({"hour":15,"minute":30}).add(1,"days").utcOffset("+05:30").format()
const endTime   = moment().set({"hour":16,"minute":30}).add(1,"days").utcOffset("+05:30").format()

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
// oauth2Client.setCredentials(refresh_token);

const access_token  = "Go Get Your's";

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
    const {tokens}  =   await oauth2Client.getToken(code); 
    oauth2Client.setCredentials({refresh_token:refresh_token});
    console.log(oauth2Client) // log and get refresh token on the first request
    // res.redirect('/schedule_event');
    res.send("It's working");
});

app.get('/schedule_event',async(req, res) => {

    await calendar.events.insert({
        calendarId:"primary",
        auth: oauth2Client,
        conferenceDataVersion:1,
        sendUpdates: "all",
        requestBody :{
            summary:   "Collegify Tech Team Meeting",
            description: "Test event show that we have successfully created a calendar event using our API",
            start:{
                dateTime: startTime,
                timeZone: "Asia/Kolkata"
            },
            end:{
                dateTime: endTime,
                timeZone:"Asia/Kolkata"
            },
            conferenceData:{
                createRequest:{
                    requestId: uuid(),
                }
            },
            organizer:[
                {
                    email: "aquib@collegify.com",
                },
            ],
            attendees:[
                {
                    email: "supriyo@collegify.com",
                },
                {
                    email: "chandan@collegify.com",
                },
            ],
            reminders: {
                'useDefault': false,
                'overrides': [
                  {'method': 'email', 'minutes': 24 * 60},
                  {'method': 'popup', 'minutes': 10}
                ]
              }
        },

    })
    // oauth2Client.getTokenInfo().then(info => info.email)

    res.send({
        msg:"You have successfully logged in",
        event: "Google Meet event has been succefully created"
    })
})

app.listen(PORT,() => {
    console.log("Server listening on port " + PORT);
    // console.log(oauth2Client)
    // console.log(refresh_token)
})
