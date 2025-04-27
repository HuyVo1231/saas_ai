'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import axios from 'axios'

import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { toast } from 'sonner'

interface SubscriptionButtonProps {
  className?: string
  isProPlan: boolean
}
const SubscriptionButton = ({ className, isProPlan }: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleSubcribe = async () => {
    // to do something
    try {
      setLoading(true)
      const { data } = await axios.get('/api/stripe')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className={className}>
      <Button
        onClick={handleSubcribe}
        variant='outline'
        size='lg'
        disabled={loading}
        className={cn(
          'text-white w-full font-semibold border-none bg-gradient-to-l from-[#fb7185] via-[#a21caf] to-[#6366f1]',
          'hover:text-white cursor-pointer'
        )}>
        <span>{isProPlan ? 'Manage Subscription' : 'Upgrade to Pro'}</span>
        <Sparkles className='w-4 h-4 ml-2' />
      </Button>
    </div>
  )
}

export default SubscriptionButton
