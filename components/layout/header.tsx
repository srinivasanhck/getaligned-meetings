import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/placeholder-logo.svg"
            alt="GetAligned Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-bold">GetAligned</span>
        </Link>
      </div>
    </header>
  )
}
