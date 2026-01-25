import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, CreditCard, ArrowLeft, Loader2, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { initiateRazorpayPayment, loadRazorpayScript, RazorpayResponse } from "@/hooks/useRazorpay";
import { toast } from "@/hooks/use-toast";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentId, setPaymentId] = useState<string>("");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const amount = location.state?.amount || 0;

  // Preload Razorpay SDK
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setSdkLoaded(loaded);
      if (!loaded) {
        setSdkError(true);
      }
    });
  }, []);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please go back and scan a valid prescription.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      await initiateRazorpayPayment(
        amount,
        (response: RazorpayResponse) => {
          // Payment successful
          setPaymentId(response.razorpay_payment_id);
          setIsProcessing(false);
          setIsComplete(true);
          toast({
            title: "Payment Successful!",
            description: `Transaction ID: ${response.razorpay_payment_id}`,
          });
        },
        () => {
          // Payment dismissed
          setIsProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "You can try again when ready.",
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
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
            <p className="text-muted-foreground text-lg mb-4">
              Your medicines will be dispensed shortly.
            </p>
            <p className="text-5xl font-bold text-primary mb-4">₹{amount}</p>
            {paymentId && (
              <p className="text-sm text-muted-foreground mb-8">
                Transaction ID: <span className="font-mono">{paymentId}</span>
              </p>
            )}
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
              <p className="text-muted-foreground">Secure payment via Razorpay</p>
            </div>

            <div className="bg-secondary rounded-xl p-6 text-center mb-8">
              <p className="text-muted-foreground text-sm mb-1">Amount to Pay</p>
              <p className="text-4xl font-bold text-primary">₹{amount}</p>
            </div>

            {/* Payment Methods Info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-medium block">UPI Payment</span>
                  <span className="text-sm text-muted-foreground">GPay, PhonePe, Paytm & more</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-medium block">Card Payment</span>
                  <span className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</span>
                </div>
              </div>
            </div>

            {sdkError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">Failed to load payment gateway. Please refresh.</p>
              </div>
            )}

            <Button
              onClick={handlePayment}
              disabled={isProcessing || !sdkLoaded || sdkError || !amount}
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-button bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : !sdkLoaded && !sdkError ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              🔒 Secured by Razorpay • Test Mode
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
