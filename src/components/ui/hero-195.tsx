
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";
import { Badge } from "@/components/ui/badge";
import { Mic, Play, Sparkles, Bot, Zap, Shield } from "lucide-react";

export const Hero195 = () => {
  return (
    <section className="w-full py-20 lg:py-40">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Voice Technology
              </Badge>
              <h1 className="text-4xl font-bold lg:text-6xl">
                Meet{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Voice Bolt
                </span>
              </h1>
              <p className="text-xl text-muted-foreground lg:text-2xl">
                Your AI voice assistant that understands, responds, and adapts to your needs in real-time
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Mic className="mr-2 h-5 w-5" />
                Create Your Voice Agent
              </Button>
              <Button variant="outline" size="lg">
                <Play className="mr-2 h-5 w-5" />
                Try Live Demo
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">24/7 Support</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Lightning Fast</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">Secure & Private</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <Card className="w-[380px]">
                <BorderBeam size={250} duration={12} delay={9} />
                <CardHeader>
                  <CardTitle>Get Started with Voice Bolt</CardTitle>
                  <CardDescription>
                    Create your AI voice agent in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="create">Create Agent</TabsTrigger>
                      <TabsTrigger value="demo">Try Demo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Agent Name</Label>
                        <Input id="name" placeholder="My Voice Assistant" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="you@company.com" type="email" />
                      </div>
                      <Button className="w-full">
                        <Mic className="mr-2 h-4 w-4" />
                        Create Agent
                      </Button>
                    </TabsContent>
                    <TabsContent value="demo" className="space-y-4">
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mic className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Experience Voice Bolt in action
                        </p>
                        <Button className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Start Demo
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
