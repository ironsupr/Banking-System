import { NextRequest, NextResponse } from 'next/server';
import { bankingFAQs } from '@/lib/faq';

const faqContext = bankingFAQs
  .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
  .join('\n\n');

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // replace with your actual domain in prod
        'X-Title': 'Shauryan-Chatbot',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant. Use the following FAQ information to help answer user queries:\n\n${faqContext}`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content || 'Sorry, no response from the bot.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { reply: 'Sorry, something went wrong.' },
      { status: 500 }
    );
  }
}
