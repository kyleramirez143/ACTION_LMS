
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

async function generateText(prompt) {
    try {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Choose your desired model
        messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error generating text:", error);
        return null;
    }
}

generateText("Write a short sentence about a talking cat.")
    .then(text => console.log(text))
    .catch(err => console.error(err));

    