require('dotenv').config()
const { format } = require('date-fns');
const { Client } = require("@notionhq/client")
const fetch = require('node-fetch');

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

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
    console.log(newSubscriber)
  } catch (error) {
    console.error(error)
  }
}

async function addButtonDownSubscriber(email, name = "") {
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
          email: email,
          notes: `Name: ${name}`
        })
      }
    )
    console.log(buttonDownResponse)
  } catch (error) {
    console.error(error)
  }
}

async function addNewSubscriber(email, name) {
  try {
    await addButtonDownSubscriber(email, name)
    await addSubscriberToNotionDatabase(email, name);
  } catch (error) {
    console.error(error)
  }
}

addNewSubscriber("brandon_l@mac.com", "Brandon Leichty")