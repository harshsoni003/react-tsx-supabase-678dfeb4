import React from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Book Slot', href: 'https://cal.com/voicebolt/15min', external: true },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
]

interface NavbarProps {
  onCreateAgent: () => void;
  isLoggedIn: boolean;
  onSignOut?: () => void;
}

const Navbar = ({ onCreateAgent, isLoggedIn, onSignOut }: NavbarProps) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    const handleMenuItemClick = (href: string) => {
        setMenuState(false)
        
        if (href.startsWith('#')) {
            // Scroll to section
            const element = document.getElementById(href.substring(1))
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }
    
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <div className="flex items-center space-x-2">
                                <img 
                                    src="DYOTA_logo-removebg-preview.png" 
                                    alt="DYOTA Logo" 
                                    className="h-16 w-auto"
                                />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">Voice Bolt</span>
                            </div>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        {item.external ? (
                                            <a
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </a>
                                        ) : item.href.startsWith('/') ? (
                                            <Link
                                                to={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        ) : (
                                            <a
                                                href={item.href}
                                                onClick={(e) => {
                                                    if (item.href.startsWith('#')) {
                                                        e.preventDefault()
                                                        handleMenuItemClick(item.href)
                                                    }
                                                }}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            {item.external ? (
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                                    onClick={() => setMenuState(false)}>
                                                    <span>{item.name}</span>
                                                </a>
                                            ) : item.href.startsWith('/') ? (
                                                <Link
                                                    to={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                                    onClick={() => setMenuState(false)}>
                                                    <span>{item.name}</span>
                                                </Link>
                                            ) : (
                                                <a
                                                    href={item.href}
                                                    onClick={(e) => {
                                                        if (item.href.startsWith('#')) {
                                                            e.preventDefault()
                                                            handleMenuItemClick(item.href)
                                                        }
                                                    }}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                {isLoggedIn ? (
                                    <>
                                        <Link to="/dashboard">
                                            <Button
                                                size="sm"
                                                className={cn(isScrolled ? 'lg:inline-flex' : 'inline-flex')}>
                                                <span>Dashboard</span>
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(isScrolled ? 'lg:inline-flex' : 'inline-flex')}
                                            onClick={onSignOut}>
                                            <span>Sign Out</span>
                                        </Button>
                                    </>
                                ) : (
                                    <a 
                                        href="https://x.com/voiceboltai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            size="sm"
                                            className="bg-black hover:bg-black/90 text-white px-4 py-2 rounded-full transition-all duration-300 font-medium"
                                        >
                                            <span className="flex items-center gap-3">
                                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                </svg>
                                                <span>@voiceboltai</span>
                                            </span>
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar; 