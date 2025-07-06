import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, BotMessageSquare, CalendarCheck, CreditCard } from 'lucide-react';
import { Icons } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">HealthAI Assist</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h2 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tighter">
            Your AI-Powered Healthcare Assistant
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Streamline your practice with AI-driven appointment scheduling, billing, and patient communication. Focus on what matters most: your patients.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Get Started Now</Link>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>

        <section id="features" className="bg-white py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold font-headline text-primary">Powerful Features, Seamless Integration</h3>
              <p className="mt-3 max-w-2xl mx-auto text-md text-muted-foreground">
                Everything you need to automate and optimize your clinic's operations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent-foreground p-3 rounded-full w-fit">
                    <BotMessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">AI Chat Interface</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Handle appointment scheduling and billing inquiries with a smart, conversational AI.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent-foreground p-3 rounded-full w-fit">
                    <CalendarCheck className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Calendar Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Sync with your existing calendars and manage appointments effortlessly.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent-foreground p-3 rounded-full w-fit">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Automated Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Send automated billing reminders and follow-ups to reduce administrative work.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent-foreground p-3 rounded-full w-fit">
                    <Stethoscope className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Role-Based Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Securely manage access for doctors, staff, and patients with robust user roles.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HealthAI Assist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
