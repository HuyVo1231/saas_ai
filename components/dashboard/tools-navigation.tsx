import { cn } from '@/lib/utils'
import { TOOLS } from '@/contants'
import ToolItem from './tool-item'

interface ToolsNavigationProps {
  title?: string
}
const ToolsNavigation = ({ title }: ToolsNavigationProps) => {
  return (
    <div
      className={cn(
        'flex flex-col w-full items-center px-12 overflow-y-auto scroll-smooth',
        'lg:px-4 lg:pt-0 lg:pb-6',
        '2xl:py-12'
      )}>
      <div className='text-center mb-6'>
        <h3>{title ? title : 'Unlock the power of AI'}</h3>
        <p className='text-muted-foreground text-base mt-2'>
          Chat with the smartest AI - Experience the power of AI with us
        </p>
      </div>
      <div className='w-full max-w-[30,75rem] mx-auto'>
        {TOOLS.map((tools, index) => (
          <ToolItem key={index} {...tools} />
        ))}
      </div>
    </div>
  )
}

export default ToolsNavigation
