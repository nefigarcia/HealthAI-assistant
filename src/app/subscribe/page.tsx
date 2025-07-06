import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "49",
    description: "For small clinics and individual practitioners getting started.",
    features: [
      "AI Chat Interface",
      "Calendar Integration",
      "Automated Reminders",
      "1 User Seat",
      "Basic Support",
    ],
    cta: "Choose Starter",
  },
  {
    name: "Professional",
    price: "99",
    description: "For growing practices that need more power and support.",
    features: [
      "Everything in Starter, plus:",
      "Automated Billing",
      "Advanced Analytics",
      "Up to 5 User Seats",
      "Priority Support",
    ],
    cta: "Choose Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "For large healthcare organizations with custom needs.",
    features: [
      "Everything in Professional, plus:",
      "Custom Integrations",
      "Dedicated Account Manager",
      "Unlimited User Seats",
      "24/7/365 Support",
    ],
    cta: "Contact Sales",
  },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
                <Icons.logo className="h-8 w-8" />
                <span className="text-2xl font-bold font-headline">HealthAI Assist</span>
            </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            Find the Perfect Plan
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Start your 14-day free trial today. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col shadow-lg ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
              {plan.popular && (
                <div className="text-center py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-t-md">Most Popular</div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  {plan.price === "Contact Us" ? (
                     <span className="text-4xl font-bold">Contact Us</span>
                  ) : (
                    <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
