import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary">Billing</h1>
       <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where billing information and history will be displayed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
