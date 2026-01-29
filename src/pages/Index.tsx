import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRScanner } from "@/components/QRScanner";
import { MedicineSummary } from "@/components/MedicineSummary";
import { PartialStockSelector, PartialStockItem } from "@/components/PartialStockSelector";
import { parseQRData, calculateMedicineDetails, MedicineWithPrice, MEDICINE_PRICES, getMedicinePrice } from "@/lib/medicineData";
import { initializeInventory, getAvailableMedicines, isMedicineAvailable, getMedicineStock } from "@/lib/inventoryService";
import { Pill, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewState = "scanner" | "summary" | "partial-stock" | "error";

export default function Index() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("scanner");
  const [items, setItems] = useState<MedicineWithPrice[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [unknownMedicines, setUnknownMedicines] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [availableMedicines, setAvailableMedicines] = useState<string[]>([]);
  const [partialStockItems, setPartialStockItems] = useState<PartialStockItem[]>([]);

  // Initialize inventory and get available medicines
  useEffect(() => {
    initializeInventory();
    updateAvailableMedicines();
  }, []);

  const updateAvailableMedicines = () => {
    setAvailableMedicines(getAvailableMedicines());
  };

  const handleQRScan = (data: string) => {
    const qrData = parseQRData(data);

    if (!qrData) {
      setErrorMessage("Invalid QR code format. Please scan a valid prescription QR code.");
      setView("error");
      return;
    }

    const fullyAvailable: { name: string; qty: number }[] = [];
    const partiallyAvailable: PartialStockItem[] = [];
    const outOfStockNames: string[] = [];
    const unknownNames: string[] = [];

    for (const med of qrData.medicines) {
      const price = getMedicinePrice(med.name);
      const stock = getMedicineStock(med.name);

      if (price === null) {
        // Medicine not in our catalog
        unknownNames.push(med.name);
      } else if (stock === 0) {
        // Completely out of stock
        outOfStockNames.push(`${med.name} (out of stock)`);
      } else if (stock < med.qty) {
        // Partial stock available - let user choose
        partiallyAvailable.push({
          name: med.name,
          qty: stock, // Default to available stock
          requestedQty: med.qty,
          availableStock: stock,
          pricePerUnit: price,
          totalPrice: stock * price,
          selected: true, // Pre-selected
        });
      } else {
        // Full stock available
        fullyAvailable.push(med);
      }
    }

    // If there are partial stock items, show the selector
    if (partiallyAvailable.length > 0) {
      // Also include fully available items in the selector for consistency
      const allItems: PartialStockItem[] = [
        ...fullyAvailable.map((med) => {
          const price = getMedicinePrice(med.name) || 0;
          return {
            name: med.name,
            qty: med.qty,
            requestedQty: med.qty,
            availableStock: getMedicineStock(med.name),
            pricePerUnit: price,
            totalPrice: med.qty * price,
            selected: true,
          };
        }),
        ...partiallyAvailable,
      ];
      
      setPartialStockItems(allItems);
      setUnknownMedicines([...unknownNames, ...outOfStockNames]);
      setView("partial-stock");
      return;
    }

    // No partial stock issues - proceed normally
    const result = calculateMedicineDetails(fullyAvailable);
    setItems(result.items);
    setGrandTotal(result.grandTotal);
    setUnknownMedicines([...result.unknownMedicines, ...unknownNames, ...outOfStockNames]);
    setView("summary");
  };

  const handlePartialStockConfirm = (selectedItems: MedicineWithPrice[]) => {
    if (selectedItems.length === 0) {
      handleCancel();
      return;
    }
    
    const total = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setItems(selectedItems);
    setGrandTotal(total);
    setView("summary");
  };

  const handleConfirm = () => {
    navigate("/payment", { state: { amount: grandTotal, items } });
  };

  const handleCancel = () => {
    updateAvailableMedicines();
    setView("scanner");
    setItems([]);
    setGrandTotal(0);
    setUnknownMedicines([]);
    setPartialStockItems([]);
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
          Available: {availableMedicines.length > 0 
            ? availableMedicines.map((name) => `${name} (₹${MEDICINE_PRICES[name]})`).join(" • ")
            : "No medicines in stock"}
        </p>
      </footer>
    </div>
  );
}
