import React, { useMemo } from 'react'
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
    const currentMonth = useMemo(() => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[new Date().getMonth()];
    }, []);

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
                                            <span className="text-foreground text-sm font-medium">Only 5 spots left this {currentMonth}</span>
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
                                            <span className="text-nowrap">Build Your Voice Agent</span>
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                    {/* <Button
                                        key={2}
                                        onClick={() => window.open('https://cal.com/voicebolt/15min', '_blank')}
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <span className="text-nowrap">Book a Slot</span>
                                        <ArrowRight className=" h-4 w-4" />
                                    </Button> */}
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
                                <div className="relative mx-auto max-w-6xl rounded-2xl border shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
                                    <div className="relative aspect-video">
                                        <iframe 
                                            src="https://www.loom.com/embed/a79c5800ed9748b1af55bbe53e011869?sid=71aa42dc-b359-449e-a225-d2b873f30ae1&autoplay=1&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"
                                            frameBorder="0"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full"
                                            title="Voice Agent Demo"
                                        />
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
