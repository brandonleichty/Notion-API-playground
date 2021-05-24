require('dotenv').config()
const { format } = require('date-fns');
const { Client } = require("@notionhq/client")

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});



async function addNewSubscriber(email, name = "") {
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

addNewSubscriber("woz@apple.com", "Steve Wozniak");