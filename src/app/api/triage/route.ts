import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    
    let textResponse = "";

    if (lastUserMessage.includes("bank") || lastUserMessage.includes("drain") || lastUserMessage.includes("money") || lastUserMessage.includes("fraud") || lastUserMessage.includes("credit card")) {
      textResponse = 'Please freeze your bank cards and accounts immediately to prevent further unauthorized transactions. Call 1930 right away to report this financial fraud. EMERGENCY_TRIGGER_1930';
    } else if (lastUserMessage.includes("blackmail") || lastUserMessage.includes("extort") || lastUserMessage.includes("threat") || lastUserMessage.includes("ransom")) {
      textResponse = 'Do not pay any ransom or give in to their demands. Please take screenshots of all conversations, preserve URLs, and do not delete any chats. EXTORTION_TRIGGER';
    } else if (lastUserMessage.includes("scam") || lastUserMessage.includes("harass") || lastUserMessage.includes("fake") || lastUserMessage.includes("bully")) {
      textResponse = 'Please take screenshots of the harassment and preserve any URLs or profile links. Do not delete any chats as they are crucial evidence. Proceed to the portal to file a formal complaint. GENERAL_TRIGGER';
    } else {
      textResponse = 'Please proceed to the registration portal to file a formal complaint with all relevant details. GENERAL_TRIGGER';
    }

    return NextResponse.json({ 
      text: textResponse
    });

  } catch (error: any) {
    console.error("Local AI Mock Error:", error);
    const msg = error.message ? `: ${error.message}` : '';
    return NextResponse.json(
      { error: "Failed to generate triage response" + msg },
      { status: 500 }
    );
  }
}
