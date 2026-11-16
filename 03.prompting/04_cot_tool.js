import {OpenAI} from "openai";
import dotenv from "dotenv";
import axios from "axios";
import { exec } from "child_process";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function getWeatherData(cityName){
  const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
  const response = await axios.get(url, {responseType: 'text'});
  const parsedResult = JSON.stringify({cityName, weatherInfo: response.data})
  return parsedResult;
}

async function executeCommandOnCli(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err, out) => {
      if(err) return res(`There is an error: ${err.message}`);
      else return res(out);
    })
  })
}

const SYSTEM_PROMPT = `
You are an AI expert enginner, 

Persona:
You are a senior software enginner, and you can understand only technical stuff
Persona Traits:
you only understand and use technical jargons
you dont answer anything which is not techincal
think and provide optimal solution as a senior software engineer
you dont answer any personal questions and involve in personal life

first understand the user's input and 
breakdown the input into multiple sub problems before coming to the final solution,
and understand user intentions and then breakdown the intentions and solve
them step by step

You are going to follow this pipeline "INITIAL", "THINK", "TOOL_REQUEST", "ANALYSE", "OUTPUT"

INITIAL - Understand the user problem statement, and what is the context about and what is the user expecting
THINK - Here breakdown the problem into subproblems and understand it step by step and then solve the subproblem
ANALYSE - analyse the solution that is solved by the sub problem and accuracy
THINK - Go back to the thinking and pick the next sub problem until there are any left
TOOL_REQUEST - call this step for requesting a tool, you can request it in this format:
               {step: "TOOL_REQUEST", functionName: "getWeatherData", input: "Goa" }
ANALYSE - get the entire solution and see weather it is matching the user expected output if not correct it
OUTPUT - give me the output in simple, short and straight forward details

Available Tools: getWeatherData(cityName: string) returns {cityName, weatherInfo}
                 executeCommandOnCli(cmd: string) returns result of the executed command
                 mine is windows powershell and if there are any errors while running the commands, try to analyze and 
                 fix and rerun, read the created files data and verify then run it on the browser

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
  "step" : "INITIAL | THINK | ANALYZE | TOOL_REQUEST | OUTPUT",
  "text" : "<Your text here>",
  "functionName" : "<Name of the function>"
  "input" : "<Input given>"
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

    if(parsedResult.step.toUpperCase() === "TOOL_REQUEST"){
      
      const functionName = parsedResult.functionName;
      const input = parsedResult.input;

      switch(functionName){
        case "executeCommandOnCli":
          {
            try {
                const result = await executeCommandOnCli(input);
                console.log(`⚒️ functionName: ${functionName}:input(${input})`, result);
                MESSAGES_DB.push({
                role: "developer",
                content: JSON.stringify({
                  step: "TOOL_OUTPUT",
                  output: result
                })
              })
            } catch (error) {
              MESSAGES_DB.push({
                role: "developer",
                content: JSON.stringify({
                  status: 'error',
                  error
                })
              })
            }
            continue;
          }
        case "getWeatherData":
        {
          const result = await getWeatherData(input);
          console.log(`⚒️ functionName: ${functionName}:input(${input})`, result);
          MESSAGES_DB.push({
            role: "developer",
            content: JSON.stringify({
              step: "TOOL_OUTPUT",
              output: result
            })
          })
        }
        break;
      }
    }
   }
}


//  main("I want to buy a new mobile first, and my budget is 20k, it should be camera and baterry focused, suggest me a good phone!")
// main("What's the weather likely in Hyderabad, Telangana? and i want you to create a weather folder and put the weather data in a webpage and run it in my browser with some styles");

// main("what is the meaning of life?"); // no ans

main("what is the meaning of life? i need it for my html page that i need to design, just send me the context");

