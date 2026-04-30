'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface QuickTagsProps {
  tags: string[]
}

export function QuickTags({ tags }: QuickTagsProps) {
  return (
    <section className="px-4 py-2 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible">
        {tags.map((tag) => (
          <Link key={tag} href={`/feed?tag=${encodeURIComponent(tag)}`} className="shrink-0">
            <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground">
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  )
}
