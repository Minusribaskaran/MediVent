import { MedicineWithPrice } from "@/lib/medicineData";
import { Pill, ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicineSummaryProps {
  items: MedicineWithPrice[];
  grandTotal: number;
  unknownMedicines: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function MedicineSummary({
  items,
  grandTotal,
  unknownMedicines,
  onConfirm,
  onCancel,
}: MedicineSummaryProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-[image:var(--gradient-header)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-foreground">Order Summary</h2>
              <p className="text-primary-foreground/80 text-sm">Review your medicines</p>
            </div>
          </div>
        </div>

        {/* Medicine List */}
        <div className="p-6">
          {unknownMedicines.length > 0 && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Unavailable Medicines</p>
                  <p className="text-sm text-destructive/80">
                    {unknownMedicines.join(", ")} - not in stock
                  </p>
                </div>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No available medicines in your prescription</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-secondary rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.pricePerUnit} × {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-foreground">₹{item.totalPrice}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-muted-foreground">Grand Total</span>
                  <span className="text-2xl font-bold text-primary">₹{grandTotal}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-14 text-lg font-semibold"
          >
            Scan Again
          </Button>
          <Button
            onClick={onConfirm}
            disabled={items.length === 0}
            className="flex-1 h-14 text-lg font-semibold shadow-button bg-accent hover:bg-accent/90"
          >
            Confirm & Pay
          </Button>
        </div>
      </div>
    </div>
  );
}
