'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface QuickTagsProps {
  tags: string[]
}

export function QuickTags({ tags }: QuickTagsProps) {
  return (
    <section className="px-4 py-2 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-5 gap-2 sm:flex sm:flex-wrap">
        {tags.map((tag) => (
          <Link key={tag} href={`/feed?tag=${encodeURIComponent(tag)}`} className="min-w-0">
            <Badge variant="outline" className="w-full cursor-pointer justify-center px-2 py-2 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto sm:px-4 sm:text-sm">
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  )
}
