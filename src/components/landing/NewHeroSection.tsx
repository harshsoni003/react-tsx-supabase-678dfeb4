import React from 'react'
import { ArrowRight, Phone, Clock, PhoneCall, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import Navbar from './Navbar'
import { Variants } from 'framer-motion'

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
                type: 'spring' as const,
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

export const NewHeroSection = ({ onCreateAgent, onTalkWithBot, isLoggedIn = false, onSignOut }: NewHeroSectionProps) => {
    return (
        <>
            <Navbar onCreateAgent={onCreateAgent} isLoggedIn={isLoggedIn} onSignOut={onSignOut} />
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
                                            type: 'spring' as const,
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
                                <AnimatedGroup variants={{
                                    container: {},
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
                                                type: 'spring' as const,
                                                bounce: 0.3,
                                                duration: 1.5,
                                            },
                                        },
                                    }
                                }}>
                                    <button
                                        onClick={() => window.open('https://cal.com/voicebolt/15min', '_blank')}
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex items-center justify-center">
                                                <div className="size-4 rounded-full z-10" style={{ backgroundColor: '#E3A838' }}></div>
                                                <div className="absolute size-4 rounded-full animate-ping-slow" style={{ backgroundColor: 'rgba(227, 168, 56, 0.5)' }}></div>
                                                <div className="absolute size-6 rounded-full animate-ping-slow animation-delay-300" style={{ backgroundColor: 'rgba(227, 168, 56, 0.3)' }}></div>
                                                <div className="absolute size-8 rounded-full animate-ping-slow animation-delay-600" style={{ backgroundColor: 'rgba(227, 168, 56, 0.1)' }}></div>
                                            </div>
                                            <span className="text-foreground text-sm font-medium">Only 7 spots left this June</span>
                                        </div>
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
                                        Turn Every Website Visit Into a Sale
                                    </h1>
                                    
                                    
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
                                                    type: 'spring' as const,
                                                    bounce: 0.3,
                                                    duration: 1.5,
                                                },
                                            },
                                        }
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
                                        onClick={() => window.open('https://cal.com/voicebolt/15min', '_blank')}
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <span className="text-nowrap">Book a Slot</span>
                                        <ArrowRight className=" h-4 w-4" />
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
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 1.5,
                                        },
                                    },
                                }
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
            </main>
        </>
    )
}

export default NewHeroSection;
