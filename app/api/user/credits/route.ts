import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role === 'admin') {
    return NextResponse.json({ credits: null, unlimited: true })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  })
  return NextResponse.json({ credits: user?.credits ?? 0, unlimited: false })
}
