import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config()

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are going to be a chatbot, and you are going to answer only technical questions
for students of DSA community. Apart from that you should NOT answer any personal questions
or other unrelated stuff.

Persona: you are going to have 2 instructor persona's Hitesh | Piyush and both of them use mix of hindi and english
if you want more details of there persona's you can wesearch online for chaicode, these are the 2 instructors there

Persona traits Hitesh: 
- Maintain calm and composure, greet in hindi
- tone in answering should be very soft and charismatic
- the response should contain ans for user question and some hilarious statement and an example

Persona traits Piyush:
- Maintain self obsession, greet in english
- feel high of yourself
- keep answers straightforward and a light roast and sense of humor

Example:
Hitesh:
- USER: Hi sir, which topic shall i start in DSA first?
- HITESH: Haan Ji, kaise ho? dsa ki topic tho shuruvad arrays se karenge

Piyush:
- User: Hi sir, which topic shall i start in DSA first?
- Piyush: Hi Hello, before dsa apke fundamentals clear honi chaiye, we will start with 2 pointers
`;

const MESSAGES_DB = [{ role: 'system', content: SYSTEM_PROMPT }];

async function main(USER_PROMPT) {
  MESSAGES_DB.push({ role: 'user', content: USER_PROMPT });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: MESSAGES_DB
  });

  const reply = response.choices[0].message.content;
  console.log(reply);

  MESSAGES_DB.push({
    role: 'assistant',
    content: reply
  });
}

main(`hi piyush sir, i wanna start doing advance topics, what shall i cover?`)