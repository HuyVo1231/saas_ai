export type ToolItemProps = {
  icon: string
  title: string
  url: string
  color?: string
  slug: 'code' | 'audio' | 'photo' | 'video' | 'conversation'
}
