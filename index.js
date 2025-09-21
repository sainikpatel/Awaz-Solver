const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is running"

    })
})

app.post('/api/generate-code', async (req, res) => {
    const { command, context } = req.body;


    if (process.env.MOCK_MODE === 'true') {
        console.log('Mock mode is enabled. Returning a fake response.');

        const mockCode = "```python\n# This is a mock response from the server.\nprint('Hello from Mock Mode!')\n```";

        return res.json({ code: mockCode });
    }

    try {
        let messages;

        if (context) {
            messages = [
                {
                    role: 'system',
                    content: 'You are an expert code refactoring assistant. Given a block of code and an instruction, rewrite the code to apply the instruction. Respond only with the final, modified code block in markdown format.'
                },
                {
                    role: 'user',
                    content: `Here is the code block:\n\'\'\'\n${context}\n\'\'\'\nHere is my instruction: "${command}"`
                }
            ]
        } else {
            messages = [
                {
                    role: 'system',
                    content: 'You are an expert code generator.Analyse the users prompt and answer it accordingly, but if the user asks you to write code respond only with a code block'
                },
                {
                    role: 'user',
                    content: command,
                },
            ]
        }
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: messages,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                }
            }
        );
        const code = response.data.choices[0].message.content;
        res.json({ code });

    }
    catch (error) {
        console.error('Error calling Groq API:', error.response ? error.response.data : error.message)
        res.status(500).json({ "error": "An error occurred while generating the code." })
    }

})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
