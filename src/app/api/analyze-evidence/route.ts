import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const prompt = `
      You are a cybercrime forensic assistant. Analyze this uploaded evidence screenshot.
      Extract the following information into a strict JSON format. Do NOT wrap it in markdown block quotes or add any conversational text. Return ONLY the raw JSON object.
      
      {
        "crimeType": "Categorize the crime (e.g., Financial Fraud, Phishing, Harassment, Fake Profile)",
        "platform": "Identify the app, website, or platform visible (e.g., WhatsApp, Instagram, SMS, Fake Website)",
        "suspectInfo": "Extract any suspect phone numbers, UPI IDs, usernames, or email addresses",
        "technicalArtifacts": "Extract any visible URLs, IP addresses, domain names, or crypto wallet addresses. Return 'None detected' if none exist",
        "dateOfIncident": "Extract any visible dates or timestamps",
        "description": "A clear, empathetic 2-3 sentence summary of what the AI thinks is happening in the evidence (e.g., 'This appears to be a parcel scam where the sender is pretending to be FedEx to extort money.')",
        "recommendedCategory": "Suggest the exact portal category (e.g., 'Property -> Financial Fraud', 'Individuals -> Cyberbullying & Harassment', 'Individuals -> Identity Theft')",
        "evidenceStrength": "Rate the evidence quality as 'Weak', 'Good', or 'Excellent' based on the presence of identifiable suspect data",
        "missingInformation": "List 1-2 critical pieces of information missing from this screenshot that police might need. If it's perfect, say 'None'."
      }
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64 // already contains data:image/...;base64,
                }
              }
            ]
          }
        ],
        temperature: 0.1,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let text = data.choices[0]?.message?.content || "{}";
    
    // Clean up potential markdown formatting just in case
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Evidence Analysis Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
