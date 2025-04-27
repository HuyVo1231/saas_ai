'use client'

import React from 'react'
import { cn } from '@/lib/utils'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import Sidebar, { SidebarProps } from './sidebar'
import { useSidebarStore } from '@/stores/sidebar-store'

const MobileSidebar = ({ isProPlan, userLimitCount }: SidebarProps) => {
  const { isOpen } = useSidebarStore()
  return (
    <Sheet open={isOpen}>
      <SheetContent side='left' className={cn('w-screen border-none bg-black p-0 pt-8')}>
        <SheetTitle></SheetTitle>
        <Sidebar isProPlan={isProPlan} userLimitCount={userLimitCount} />
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
