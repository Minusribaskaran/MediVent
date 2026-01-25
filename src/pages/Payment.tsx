import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const amount = location.state?.amount || 0;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="bg-[image:var(--gradient-header)] px-6 py-4">
          <h1 className="text-2xl font-bold text-primary-foreground text-center">
            MediVend
          </h1>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <CheckCircle className="w-14 h-14 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Your medicines will be dispensed shortly.
            </p>
            <p className="text-5xl font-bold text-primary mb-8">₹{amount}</p>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="h-14 px-8 text-lg font-semibold shadow-button"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Scanner
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-[image:var(--gradient-header)] px-6 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Payment</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Complete Payment</h2>
              <p className="text-muted-foreground">Tap below to pay</p>
            </div>

            <div className="bg-secondary rounded-xl p-6 text-center mb-8">
              <p className="text-muted-foreground text-sm mb-1">Amount to Pay</p>
              <p className="text-4xl font-bold text-primary">₹{amount}</p>
            </div>

            {/* Dummy Payment Methods */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">UPI</span>
                </div>
                <span className="font-medium">UPI Payment</span>
              </div>
              <div className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">Card Payment</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-button bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
