import UpgradeProModal from '@/components/dashboard/upgrade-pro-modal'
import Topbar from '@/components/header/topbar'
import MobileSidebar from '@/components/sidebar/mobile-sidebar'
import Sidebar from '@/components/sidebar/sidebar'
import { cn } from '@/lib/utils'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isProPlan = false

  return (
    <div>
      <header>
        <Topbar />
      </header>
      <main
        className={cn(
          'lg:bg-gray-950 lg:overflow-hidden lg:pl-80 [&:has([is-navbar-minimal])]:lg:pl-20 lg:pr-7 lg:py-7'
        )}>
        <Sidebar
          userLimitCount={0}
          isProPlan={false}
          className={cn('fixed left-0 z-20 w-80 hidden', 'lg:block')}
        />
        <MobileSidebar isProPlan={false} userLimitCount={0} />
        <UpgradeProModal isProPlan={false} />
        <div
          className={cn('bg-background h-[calc(100vh-56px)]', 'lg:rounded-3xl lg:p-7')}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
