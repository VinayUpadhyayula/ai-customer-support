import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import mime from 'mime';
const prompt = ""

export async function POST(req) {
    const convertImageToBase64 = async (imagePath) => {
        try {
          const fileBuffer = await fs.promises.readFile(imagePath); // Read file as a buffer
          return fileBuffer.toString('base64'); // Convert buffer to Base64
        } catch (err) {
          console.error('Error converting image to Base64:', err);
          throw err;
        }
    }
    const geminiAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imageFile = "public/images/line_graph.png"
    if(imageFile){
        const base64Image = await convertImageToBase64(imageFile);
    const data = await req.json()
    console.log(data.image)
    // const chat = model.startChat(
    //     {
    //         history: data.messages
    //     }
    // );
    const chat = model.startChat({
        history: [
            {
                role: "user", // Set system behavior and initial context
                parts: 
                    [
                        {
                            text:"You are a tableau report assistant that can analyze images, provide insights in a formatted way",
                        },
                        {
                            inlineData: {
                              mimeType: mime.getType(imageFile),
                              data: data.image,
                            },
                        }
                        
                    
                    ]
                    
                }
        ]
    });
    // const chat = await model.startChat({
    //     query: `Analyze this image: ${base64Image}`
    //   });

    //chat = model.start_chat(query=query)
    const result = await chat.sendMessageStream(data.text);
    //console.log(result);

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
                // Iterate over the streamed chunks of the response
                for await (const chunk of result.stream) {
                    console.log(chunk.text());
                    const content = chunk.text();// Extract the content from the chunk
                    if (content) {
                        const text = encoder.encode(content) // Encode the content to Uint8Array
                        controller.enqueue(text) // Enqueue the encoded text to the stream
                    }
                }
            } catch (err) {
                controller.error(err) // Handle any errors that occur during streaming
            } finally {
                controller.close() // Close the stream when done
            }
        },
    })

    return new NextResponse(stream)
}
}