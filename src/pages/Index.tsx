import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Brain, 
  Eye, 
  MessageSquare, 
  Mic, 
  Smartphone, 
  Rocket
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  useEffect(() => {
    document.title = "CrewMind - AI-Powered Industrial Support";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Revolutionary AI platform for frontline workers: 3D digital twins, voice assistance, and intelligent industrial support.');
  }, []);

  const features = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: "3D Digital Twin",
      description: "Interactive 3D visualization of your industrial environment"
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice + Chat",
      description: "Natural language interaction with AI assistance"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "RAG Context",
      description: "Intelligent retrieval of relevant information"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Device Highlight",
      description: "Smart identification and highlighting of equipment"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight text-foreground mb-6">
            AI-powered support for
            <span className="block text-primary">frontline workers</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Transform your industrial operations with intelligent voice assistance, 3D digital twins, and context-aware AI that understands your environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <NavLink to="/workspace">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                <Rocket className="h-5 w-5 mr-2" />
                Launch Workspace
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </NavLink>
            
            <NavLink to="/mobile-connectivity">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold">
                <Smartphone className="h-5 w-5 mr-2" />
                Mobile Setup
              </Button>
            </NavLink>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Enterprise Security
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              High Performance
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              AI-Powered
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Powerful Features for Modern Industry
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to empower your frontline workers with intelligent assistance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border border-border bg-card hover:border-primary/20 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, intuitive, and powerful - get started in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Ask Your Question</h3>
              <p className="text-muted-foreground">
                Simply ask "What's the maintenance procedure for Machine 2?" using voice or text
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI Retrieves Context</h3>
              <p className="text-muted-foreground">
                Our AI instantly finds relevant procedures, manuals, and documentation
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Get Visual Response</h3>
              <p className="text-muted-foreground">
                See the machine highlighted in 3D and hear the AI explain the procedure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Communication Options */}
      <section className="py-20 bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Multiple Ways to Connect
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the interface that works best for your workflow
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border border-border bg-card hover:border-primary/20 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Text Chat</CardTitle>
                <CardDescription>
                  Traditional text-based interaction in the workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <NavLink to="/workspace">
                  <Button className="w-full">
                    Open Workspace
                  </Button>
                </NavLink>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:border-accent/20 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-foreground">Desktop Voice</CardTitle>
                <CardDescription>
                  Use your computer's microphone for hands-free operation
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <NavLink to="/voice-chat">
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    Start Voice Chat
                  </Button>
                </NavLink>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:border-primary/20 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Mobile Voice</CardTitle>
                <CardDescription>
                  Push-to-talk from your mobile device with QR connection
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <NavLink to="/mobile-connectivity">
                  <Button className="w-full">
                    Setup Mobile
                  </Button>
                </NavLink>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Transform your industrial operations with AI-powered assistance today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/workspace">
                <Button size="lg" className="px-8 py-4">
                  Launch Workspace
                </Button>
              </NavLink>
              <NavLink to="/contact">
                <Button variant="outline" size="lg" className="px-8 py-4">
                  Contact Us
                </Button>
              </NavLink>
            </div>
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                © 2025 CrewMind. AI-powered industrial support platform.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
