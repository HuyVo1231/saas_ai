import { auth } from '@clerk/nextjs/server'

import { DAY_IN_MS, MAX_FREE_COUNTS } from '@/contants'
import prismadb from './prismadb'

export const getUserLimit = async () => {
  const { userId } = await auth()

  if (!userId) return null

  return await prismadb.userLimit.findUnique({
    where: {
      userId: userId
    }
  })
}

export const getUserLimitCount = async () => {
  const userLimit = await getUserLimit()

  if (!userLimit) return 0

  return userLimit?.count
}

export const checkUserLimit = async () => {
  const userLimit = await getUserLimit()

  if (!userLimit || userLimit.count < MAX_FREE_COUNTS) return true

  return false
}

export const incrementUserLimit = async () => {
  const { userId } = await auth()

  if (!userId) return null
  const userLimit = await getUserLimit()
  if (userLimit) {
    return await prismadb.userLimit.update({
      where: {
        userId: userId
      },
      data: {
        count: {
          increment: 1
        }
      }
    })
  }

  return await prismadb.userLimit.create({
    data: {
      userId: userId,
      count: 1
    }
  })
}

export const checkSubscription = async () => {
  const { userId } = await auth()

  if (!userId) return false

  const userSubcription = await prismadb.userSubscription.findUnique({
    where: {
      userId
    }
  })

  if (!userSubcription) return false

  const isValid =
    userSubcription.stripePriceId &&
    userSubcription.stripeCurrentPeriodEnd &&
    userSubcription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now()

  return !!isValid
}
