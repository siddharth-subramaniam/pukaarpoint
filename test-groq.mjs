import fs from 'fs';
const apiKey = "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";

// Create a dummy 1x1 pixel base64 jpeg
const dummyBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.2-90b-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: "Hello"
          },
          {
            type: 'image_url',
            image_url: {
              url: dummyBase64
            }
          }
        ]
      }
    ],
    temperature: 0.1
  })
});

const text = await response.text();
console.log(response.status, text);
