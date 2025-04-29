'use client'

import { useRef } from 'react'
import { useChat } from '@ai-sdk/react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

import ToolsNavigation from '@/components/dashboard/tools-navigation'
import UserMessage from '@/components/dashboard/user-message'
import AiResponse from '@/components/dashboard/ai-reponse'
import MarkdownReponse from '@/components/dashboard/markdown-reponse'

const ConversationPage = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
    setMessages
  } = useChat({
    api: '/api/conversation'
  })

  const handleClearChat = () => {
    setMessages([])
  }
  return (
    <div className='relative flex flex-col w-full justify-between'>
      <div
        ref={containerRef}
        className='overflow-y-auto space-y-10 scroll-smooth h-[calc(100vh-180px)]'>
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <div key={message.id} className='whitespace-pre-wrap'>
                {message.role === 'user' ? (
                  <UserMessage>
                    <MarkdownReponse content={message.content} />
                  </UserMessage>
                ) : (
                  <AiResponse>
                    <MarkdownReponse content={message.content} />
                  </AiResponse>
                )}
              </div>
            ))}
            <div className='absolute left-0 bottom-20 text-right w-full pr-3'>
              <Button size={'sm'} variant={'outline'} onClick={handleClearChat}>
                Clear chat
              </Button>
            </div>
          </>
        ) : (
          <ToolsNavigation title='Conversation' />
        )}
      </div>
      <div className='mb-[13px]'>
        <form
          onSubmit={isLoading ? stop : handleSubmit}
          className='flex justify-center w-full relative'>
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder='Do you have question today?'
            className='resize-none min-h1'
          />
          <Button type='submit' disabled={!input} className='absolute right-3 top-3'>
            {isLoading ? 'Stop' : <Send />}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ConversationPage
