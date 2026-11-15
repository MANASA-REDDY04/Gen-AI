import {OpenAI} from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: "user",
      content: `is Eagle a bird or animal ?
      i need just a answer in a single word, take o/p example from below...
      Example i/p: is giraffe bird or animal? 
      Expected o/p: Animal
      Example i/p: is Nightinagle bird or animal?
      Expected o/p: Bird`
    },
  ],
});

console.log(response.choices[0].message.content);

}

main();