import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ToolItemProps {
  icon: string
  title: string
  url: string
  color?: string
  slug: 'code' | 'audio' | 'photo' | 'video' | 'conversation'
}

const toolItemColorVariants = cva('absolute inset-0 opacity-20 rounded-xl', {
  variants: {
    color: {
      code: 'bg-green-500',
      audio: 'bg-violet-500',
      photo: 'bg-violet-500',
      video: 'bg-amber-500',
      conversation: 'bg-blue-500'
    }
  },
  defaultVariants: {
    color: 'code'
  }
})

const ToolItem = ({ icon, title, url, color, slug }: ToolItemProps) => {
  return (
    <div
      className={cn(
        'group flex items-center mb-4 p-3,5 border rounded-xl transition-all',
        'lg:mb-2',
        'hover:border-transparent hover:shadow-[0_0_1rem_0.25rem_rgba(0,0,0,0.04),0px_2rem_1.5rem_-1rem_rgba(0,0,0,0.12)] last:mb-0 2xl:p-2.5 lg:p-3.5'
      )}>
      <Link href={url} className='w-full'>
        <div className='flex items-center justify-between lg:p-0 p-4'>
          <div className='flex items-center'>
            <div className='relative flex justify-center mr-6 rounded-lg p-1 w-16 h-16'>
              <div className={cn(toolItemColorVariants({ color: slug }))} />
              <Image src={icon} width={24} height={24} alt={title} />
            </div>
            <span className='font-medium'>{title}</span>
          </div>
          <ArrowRight />
        </div>
      </Link>
    </div>
  )
}

// </Link>
export default ToolItem
