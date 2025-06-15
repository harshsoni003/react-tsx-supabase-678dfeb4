
import React from 'react'
import { ArrowRight, ChevronRight, Menu, X, Mic, Phone, Clock, PhoneCall, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

interface NewHeroSectionProps {
  onCreateAgent: () => void;
  onTalkWithBot: () => void;
  isLoggedIn?: boolean;
  onSignOut?: () => void;
}

export function NewHeroSection({ onCreateAgent, onTalkWithBot, isLoggedIn = false, onSignOut }: NewHeroSectionProps) {
    return (
        <>
            <HeroHeader onCreateAgent={onCreateAgent} isLoggedIn={isLoggedIn} onSignOut={onSignOut} />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=3276&h=4095&fit=crop&crop=center"
                                alt="AI technology background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <button
                                        onClick={onTalkWithBot}
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">AI-Powered Voice Technology</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                        
                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        Meet Voice Bolt
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                    Turn your landing page visitors into booked clients 
                                    </p>
                                    <p
                                        className="mx-auto mt-2 max-w-2xl text-balance text-lg">
                                   with AI-Powered Voice Technology .
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            onClick={onCreateAgent}
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <span className="text-nowrap">Create Your Voice Agent</span>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        onClick={onTalkWithBot}
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <span className="text-nowrap">Try Live Demo</span>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mt-8 px-2 sm:mt-12 md:mt-20">
                                <div className="relative mx-auto max-w-6xl rounded-2xl border shadow-lg bg-white dark:bg-gray-900">
                                    <div className="relative p-6 overflow-visible">
                                        {/* Dashboard Visualization */}
                                        <div className="space-y-4">
                                            {/* Stats Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    {
                                                        title: 'Total Calls',
                                                        value: '1,247',
                                                        change: '+12%',
                                                        icon: <Phone className="h-6 w-6 text-[#3B82F6]" />
                                                    },
                                                    {
                                                        title: 'Total Duration',
                                                        value: '89.2h',
                                                        change: '+8%',
                                                        icon: <Clock className="h-6 w-6 text-[#3B82F6]" />
                                                    },
                                                    {
                                                        title: 'Active Calls',
                                                        value: '23',
                                                        change: '+3',
                                                        icon: <PhoneCall className="h-6 w-6 text-[#3B82F6]" />
                                                    }
                                                ].map((stat, index) => (
                                                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                                                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                                                            </div>
                                                            <div className="bg-[#3B82F6] bg-opacity-10 dark:bg-opacity-20 p-3 rounded-lg">
                                                                {stat.icon}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Live Transcription */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Transcription</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Recording</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-[#F5F7FA] dark:bg-gray-900 rounded-lg p-4 overflow-visible">
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex">
                                                            <span className="text-[#3B82F6] font-medium mr-2">Agent:</span>
                                                            <span className="text-gray-700 dark:text-gray-300">Hello, thank you for calling. How can I assist you today?</span>
                                                        </div>
                                                        <div className="flex">
                                                            <span className="text-green-600 font-medium mr-2">Client:</span>
                                                            <span className="text-gray-700 dark:text-gray-300">Hi, I'm having trouble with my recent order. The delivery was supposed to arrive yesterday.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Call History */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Call History</h3>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">5 calls</span>
                                                </div>
                                                
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date/Time</th>
                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                            {[
                                                                { id: 1, client: 'Sarah Johnson', date: '2024-06-04', time: '14:30', status: 'completed' },
                                                                { id: 2, client: 'Mike Chen', date: '2024-06-04', time: '13:15', status: 'completed' },
                                                                { id: 3, client: 'Emily Davis', date: '2024-06-04', time: '12:00', status: 'ongoing' }
                                                            ].map((call) => (
                                                                <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            {call.status === 'completed' ? (
                                                                                <Phone className="h-4 w-4 text-green-600" />
                                                                            ) : call.status === 'ongoing' ? (
                                                                                <Clock className="h-4 w-4 text-blue-600" />
                                                                            ) : (
                                                                                <PhoneOff className="h-4 w-4 text-red-600" />
                                                                            )}
                                                                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                                {call.client}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                        <div>{call.date}</div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{call.time}</div>
                                                                    </td>
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                            call.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                                            call.status === 'ongoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                        }`}>
                                                                            {call.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            
                                            {/* Analytics Visualization */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Overview</h3>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Call Types Distribution */}
                                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Call Types Distribution</h4>
                                                        <div className="flex items-center justify-center space-x-3">
                                                            {[
                                                                { name: 'Support', value: 40, color: '#3B82F6' },
                                                                { name: 'Sales', value: 30, color: '#60A5FA' },
                                                                { name: 'Follow-up', value: 20, color: '#93C5FD' },
                                                                { name: 'Other', value: 10, color: '#DBEAFE' }
                                                            ].map((item, index) => (
                                                                <div key={index} className="flex flex-col items-center">
                                                                    <div className="flex items-end h-24 mb-1">
                                                                        <div 
                                                                            style={{ 
                                                                                height: `${item.value * 1.5}px`,
                                                                                backgroundColor: item.color,
                                                                                width: '20px'
                                                                            }} 
                                                                            className="rounded-t"
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                                                                    <span className="text-xs font-medium">{item.value}%</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Performance Metrics */}
                                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Metrics</h4>
                                                        <div className="space-y-2">
                                                            {[
                                                                {
                                                                    title: 'Avg Call Duration',
                                                                    value: '14:32',
                                                                    change: '+5.2%',
                                                                    changeType: 'positive'
                                                                },
                                                                {
                                                                    title: 'Call Success Rate',
                                                                    value: '89.5%',
                                                                    change: '+2.1%',
                                                                    changeType: 'positive'
                                                                },
                                                                {
                                                                    title: 'Response Time',
                                                                    value: '2.3s',
                                                                    change: '-8.7%',
                                                                    changeType: 'negative'
                                                                }
                                                            ].map((metric, index) => (
                                                                <div key={index} className="flex justify-between items-center">
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">{metric.title}</span>
                                                                    <div className="flex items-center">
                                                                        <span className="text-xs font-medium mr-1">{metric.value}</span>
                                                                        <span className={`text-xs ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {metric.change}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <span className="block text-sm duration-150 hover:opacity-75">
                                <span>Trusted by leading companies</span>
                                <ChevronRight className="ml-1 inline-block size-3" />
                            </span>
                        </div>
                        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex">
                                <div className="mx-auto h-5 w-fit text-muted-foreground font-medium">24/7 Support</div>
                            </div>
                            <div className="flex">
                                <div className="mx-auto h-4 w-fit text-muted-foreground font-medium">Lightning Fast</div>
                            </div>
                            <div className="flex">
                                <div className="mx-auto h-4 w-fit text-muted-foreground font-medium">Secure & Private</div>
                            </div>
                            <div className="flex">
                                <div className="mx-auto h-5 w-fit text-muted-foreground font-medium">AI Powered</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#link' },
    { name: 'Solution', href: '#link' },
    { name: 'Pricing', href: '#link' },
    { name: 'About', href: '#link' },
]

interface HeroHeaderProps {
  onCreateAgent: () => void;
  isLoggedIn: boolean;
  onSignOut?: () => void;
}

const HeroHeader = ({ onCreateAgent, isLoggedIn, onSignOut }: HeroHeaderProps) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
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
                                        <a
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </a>
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
                                    <>
                                        <Link to="/signin">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={cn(isScrolled && 'lg:hidden')}>
                                                <span>Sign In</span>
                                            </Button>
                                        </Link>
                                        <Link to="/signup">
                                            <Button
                                                size="sm"
                                                className={cn(isScrolled && 'lg:hidden')}>
                                                <span>Sign Up</span>
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={onCreateAgent}
                                            size="sm"
                                            className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                            <span>Get Started</span>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
