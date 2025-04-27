'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import SubscriptionButton from '../subcription-button'
import { useProStore } from '@/stores/pro-store'

interface UpgradeProModalProps {
  isProPlan: boolean
  className?: string
}

const UpgradeProModal = ({ isProPlan, className }: UpgradeProModalProps) => {
  const { isOpen, handleCloseProModal } = useProStore()
  return (
    <Dialog open={isOpen}>
      <DialogContent onClose={handleCloseProModal} showOverlay>
        <DialogTitle />
        <SubscriptionButton isProPlan={isProPlan} />
      </DialogContent>
    </Dialog>
  )
}

export default UpgradeProModal
