'use client'

import { useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

import ToolsNavigation from '@/components/dashboard/tools-navigation'
import UserMessage from '@/components/dashboard/user-message'
import AiResponse from '@/components/dashboard/ai-reponse'
import MarkdownReponse from '@/components/dashboard/markdown-reponse'
import { useProStore } from '@/stores/pro-store'

const ConversationPage = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { handleOpenOrCloseProModal } = useProStore()

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

  useEffect(() => {
    if (error) {
      const errorParsed = JSON.parse(error.message)
      if (errorParsed.status === 403) {
        handleOpenOrCloseProModal()
      }
    }
  }, [error, handleOpenOrCloseProModal])

  useEffect(() => {
    if (messages.length > 0 && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleClearChat = () => {
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        handleSubmit(e as any)
      }
    }
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
              <Button size='sm' variant='outline' onClick={handleClearChat}>
                Clear chat
              </Button>
            </div>
          </>
        ) : (
          <ToolsNavigation title='Conversation' />
        )}
      </div>
      <div className=''>
        <form
          onSubmit={isLoading ? stop : handleSubmit}
          className='flex justify-center w-full relative'>
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder='Do you have question today?'
            className='resize-none min-h1'
            onKeyDown={handleKeyDown}
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
