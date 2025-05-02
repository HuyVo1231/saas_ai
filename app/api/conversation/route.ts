import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { checkSubscription, checkUserLimit, incrementUserLimit } from '@/lib/user-limit'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse('Missing OpenAI API Key', { status: 500 })
    }

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse('Messages are required', { status: 400 })
    }

    const reachToLimit = await checkUserLimit()
    const isPro = await checkSubscription()
    if (!reachToLimit && !isPro) {
      return NextResponse.json(
        { message: 'Free plan limit reached', status: 403 },
        { status: 403 }
      )
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      onFinish: async () => {
        if (!isPro) {
          await incrementUserLimit()
        }
      }
    })

    return result.toDataStreamResponse()
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      const { message, status } = error
      return NextResponse.json({ message, status }, { status: status as number })
    }

    console.error('Unexpected error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
