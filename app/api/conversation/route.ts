import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: Request) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Parse request body
    const { messages }: { messages: ChatMessage[] } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse('Messages are required', { status: 400 })
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse('Missing OpenAI API Key', { status: 500 })
    }

    // Create streaming response using Vercel AI SDK
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages
    })
    // Return the streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    // Handle OpenAI-specific errors
    if (error instanceof Error && 'status' in error) {
      const { message, status } = error
      return NextResponse.json({ message, status }, { status: status as number })
    }

    // Handle other errors
    console.error('Unexpected error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
