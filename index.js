require('dotenv').config()
const { format } = require('date-fns');
const { Client } = require("@notionhq/client")
const fetch = require('node-fetch');
const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

// Express route: /subscribe
app.get('/subscribe', async (req, res) => {

  const { email, name } = req.body;
  try {
    const result = await addButtonDownSubscriber(email, name)
    const { status } = result;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
})

app.listen(port, () => {
  console.log(`Buttondown & Notion API example app listening at http://localhost:${port} 🚀🚀🚀`)
})



// Initializing a Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});


async function addButtonDownSubscriber(email, name = "") {
  var notes = name ? `Name: ${name}` : "";

  try {
    const buttonDownResponse = await fetch(
      "https://api.buttondown.email/v1/subscribers",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.BUTTONDOWN_API_KEY,
        },
        body: JSON.stringify({
          email,
          notes
        })
      }
    )


    if (buttonDownResponse.status == 201 || buttonDownResponse.status == 200) {
      await addSubscriberToNotionDatabase(email, name);
      return {
        status: buttonDownResponse.status,
        message: "Success! You've subscribed!",
        email,
        name
      }
    } else {
      const errorMessage = await buttonDownResponse.json()
      const message = parseButtondownErrorMessage(errorMessage)
      return {
        status: buttonDownResponse.status,
        message,
        email,
        name
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function parseButtondownErrorMessage(errorMessage) {
  const duplcateEmailSubscriber = "That email address"
  const spammyEmail = "Sorry, our system has previously detected this email"
  const blankEmail = "This field may not be blank"


  if (errorMessage[0]?.toLowerCase().includes(duplcateEmailSubscriber.toLowerCase())) {
    return "The email address you provided is already subscribed."
  }
  if (errorMessage[0]?.toLowerCase().includes(spammyEmail.toLowerCase())) {
    return "There seems to be an issue with the address your provided."
  }
  if (errorMessage?.email[0]?.toLowerCase().includes(blankEmail.toLowerCase())) {
    return "Oops! No email address was provided."
  }

  return "Oh no! An unknown error occurred."
}


async function addSubscriberToNotionDatabase(email, name = "") {
  const today = format(new Date(), 'yyyy-MM-dd');

  try {
    const newSubscriber = await notion.pages.create({
      "parent": {
        "database_id": process.env.NOTION_DATABASE_ID
      },
      "properties": {
        "Email": {
          "email": email
        },
        "Date added": {
          "type": "date",
          "date": {
            "start": today
          }
        },
        "Name": {
          "title": [
            {
              "text": {
                "content": name
              }
            }
          ]
        }
      }
    })
    return newSubscriber;
  } catch (error) {
    console.error(error)
  }
}