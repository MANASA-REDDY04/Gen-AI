import {OpenAI} from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const SYSTEM_PROMPT = `
You are an AI expert enginner, first understand the user's input and 
breakdown the input into multiple sub problems before coming to the final solution,
and understand user intentions and then breakdown the intentions and solve
them step by step

You are going to follow this pipeline "INITIAL", "THINK", "ANALYSE", "OUTPUT"

INITIAL - Understand the user problem statement, and what is the context about and what is the user expecting
THINK - Here breakdown the problem into subproblems and understand it step by step and then solve the subproblem
ANALYSE - analyse the solution that is solved by the sub problem and accuracy
THINK - Go back to the thinking and pick the next sub problem until there are any left
ANALYSE - get the entire solution and see weather it is matching the user expected output if not correct it
OUTPUT - give me the output in simple, short and straight forward details

Rules:
1. strictly follow the pipeline i mentioned
2. i need the output in strictly JSON format
3. Always output 1 step at a time before going to the next output

Example:
user: i wanna cook chicken biryani, need a simple recipe

OUTPUT:
"INITIAL": The user wants be to get the recipe of chicken biryani
"THINK" : I need to breakdown the recipe of chicken biryani into multiple subproblems and understand it step by step and then solve the subproblem
"ANALYZE" : we need to boil the flavoured rice with the spices [elachi, clove, cinamon, bayleaves, sahijeera, greenchilli]
"THINK" : Now, the rice is boiled, i need to think of chicken marination
"ANALYZE" : next step is to marinate chicken with spices like [chilli powder, turmeric, salt, ginger garlic paste, lemon and cu"rd]
"OUTPUT" : we have boiled rice and marinated chicken, now we need to layer them and cook it in dum

OUTPUT FORMAT: 
{
  "step" : "INITIAL | THINK | ANALYZE | OUTPUT",
  "text" : "<Your text here>"
}

`
const MESSAGES_DB = [{ role: "system", content: SYSTEM_PROMPT}];


async function main(USER_PROMPT = ''){

  MESSAGES_DB.push({role: "user", content: USER_PROMPT});

  while(true){
      const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: MESSAGES_DB,
    });

    const rawResult = response.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGES_DB.push({
      role: "assistant",
      content: rawResult
    });
    
    console.log(`🤖 ${parsedResult.step}: ${parsedResult.text}`);

    // base case
    if(parsedResult.step.toLowerCase() === "output") break;
   }
}


main("I want to buy a new mobile first, and my budget is 20k, it should be camera and baterry focused, suggest me a good phone!")
