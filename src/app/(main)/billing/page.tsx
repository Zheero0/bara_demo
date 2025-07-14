
'use client';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Plan = 'Free' | 'Pro Monthly' | 'Pro Annual';

const plans = [
    {
        name: 'Free',
        price: '£0',
        priceDescription: '/month',
        description: 'Get started and browse opportunities.',
        features: [
            'Apply to 3 jobs per month',
            'Basic profile',
            'Standard support',
        ],
        buttonText: 'Downgrade',
        variant: 'outline'
    },
    {
        name: 'Pro Monthly',
        price: '£4.99',
        priceDescription: '/month',
        description: 'Unlock your full potential with Pro.',
        features: [
            'Apply to unlimited jobs',
            '"Bara Pro" badge on profile',
            'Priority support',
            'Full access to all tools'
        ],
        buttonText: 'Upgrade',
    },
    {
        name: 'Pro Annual',
        price: '£49.99',
        priceDescription: '/year',
        description: 'Save with an annual subscription.',
        features: [
            'All features from Pro Monthly',
            '2+ months free (save ~£10)',
            'Top priority support',
            'Early access to new features'
        ],
        buttonText: 'Upgrade',
    }
];

export default function BillingPage() {
    const { user, profile, reloadProfile } = useAuth();
    const { toast } = useToast();
    const [currentPlan, setCurrentPlan] = useState<Plan>('Free');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile?.plan) {
            setCurrentPlan(profile.plan as Plan);
        }
    }, [profile]);
    
    const handlePlanChange = async (newPlan: Plan) => {
        if (!user || newPlan === currentPlan) return;

        setLoading(true);
        try {
            // This is a simulation. In a real app, you'd handle Stripe checkout here.
            // For now, we just update the user's plan in Firestore.
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { plan: newPlan }, { merge: true });

            setCurrentPlan(newPlan);
            reloadProfile(); // Reload profile to get the latest plan status
            
            toast({
                title: "Plan Changed!",
                description: `You are now on the ${newPlan} plan.`,
            });
        } catch (error) {
            console.error("Error changing plan:", error);
            toast({
                title: "Error",
                description: "Could not change your plan. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-4">
                <h1 className="text-3xl font-headline font-bold">Billing & Plans</h1>
                <p className="text-muted-foreground">
                    Manage your subscription and billing details.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <Card 
                        key={plan.name} 
                        className={cn(
                            "flex flex-col",
                            currentPlan === plan.name ? "border-primary ring-2 ring-primary" : ""
                        )}
                    >
                        <CardHeader>
                            <CardTitle className="font-headline">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div>
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.priceDescription}</span>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardContent>
                             <Button 
                                className="w-full" 
                                variant={currentPlan === plan.name ? 'secondary' : 'default'}
                                disabled={loading || currentPlan === plan.name}
                                onClick={() => handlePlanChange(plan.name as Plan)}
                             >
                                {currentPlan === plan.name ? 'Current Plan' : plan.buttonText}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                        Manage your saved payment methods.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span>💳</span>
                            <div>
                                <p className="font-medium">Visa ending in 1234</p>
                                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                            </div>
                        </div>
                        <Button variant="outline">Edit</Button>
                    </div>
                    <Button>Add New Payment Method</Button>
                </CardContent>
            </Card>
        </div>
    )
}
