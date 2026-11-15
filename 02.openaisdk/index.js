import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

// api key valid only 7 days, created at: 14-11-2026
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const response = await client.responses.create({
  model: 'gpt-4o-mini',
  instructions: 'just give response in 1 simple sentence',
  input: 'Largest Planet in the Solar system ?'
})

console.log(response.output_text);