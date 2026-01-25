import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRScanner } from "@/components/QRScanner";
import { MedicineSummary } from "@/components/MedicineSummary";
import { parseQRData, calculateMedicineDetails, MedicineWithPrice } from "@/lib/medicineData";
import { Pill, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewState = "scanner" | "summary" | "error";

export default function Index() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("scanner");
  const [items, setItems] = useState<MedicineWithPrice[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [unknownMedicines, setUnknownMedicines] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleQRScan = (data: string) => {
    const qrData = parseQRData(data);

    if (!qrData) {
      setErrorMessage("Invalid QR code format. Please scan a valid prescription QR code.");
      setView("error");
      return;
    }

    const result = calculateMedicineDetails(qrData.medicines);
    setItems(result.items);
    setGrandTotal(result.grandTotal);
    setUnknownMedicines(result.unknownMedicines);
    setView("summary");
  };

  const handleConfirm = () => {
    navigate("/payment", { state: { amount: grandTotal } });
  };

  const handleCancel = () => {
    setView("scanner");
    setItems([]);
    setGrandTotal(0);
    setUnknownMedicines([]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-[image:var(--gradient-header)] px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Pill className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">MediVend</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {view === "scanner" && (
          <div className="w-full max-w-lg text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Scan Prescription</h2>
            <p className="text-muted-foreground mb-8">
              Position the QR code within the frame to scan
            </p>
            <QRScanner onScan={handleQRScan} />
          </div>
        )}

        {view === "summary" && (
          <MedicineSummary
            items={items}
            grandTotal={grandTotal}
            unknownMedicines={unknownMedicines}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}

        {view === "error" && (
          <div className="w-full max-w-md text-center">
            <div className="bg-card rounded-2xl shadow-card p-8">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Scan Error</h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Button
                onClick={handleCancel}
                size="lg"
                className="h-14 px-8 text-lg font-semibold shadow-button"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Available: Paracetamol (₹20) • Amoxicillin (₹50) • Cetirizine (₹10)
        </p>
      </footer>
    </div>
  );
}
