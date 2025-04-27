'use client'

import { Menu } from 'lucide-react'

import { cn } from '@/lib/utils'
import Logo from './logo'
import { Button } from '../ui/button'
import { useSidebarStore } from '@/stores/sidebar-store'

const Topbar = () => {
  const { handleOpenOrClose } = useSidebarStore()

  return (
    <div
      className={cn(
        'flex items-center p-4 justify-between sticky top-0 z-30',
        'lg:hidden'
      )}>
      <Logo />
      <Button onClick={handleOpenOrClose} variant='ghost' size='icon'>
        <Menu />
      </Button>
    </div>
  )
}

export default Topbar
