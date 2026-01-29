import { useState } from "react";
import { MedicineWithPrice } from "@/lib/medicineData";
import { Pill, ShoppingCart, AlertTriangle, Minus, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface PartialStockItem extends MedicineWithPrice {
  requestedQty: number;
  availableStock: number;
  selected: boolean;
}

interface PartialStockSelectorProps {
  items: PartialStockItem[];
  onConfirm: (selectedItems: MedicineWithPrice[]) => void;
  onCancel: () => void;
}

export function PartialStockSelector({
  items,
  onConfirm,
  onCancel,
}: PartialStockSelectorProps) {
  const [selections, setSelections] = useState<PartialStockItem[]>(items);

  const toggleSelection = (index: number) => {
    setSelections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateQuantity = (index: number, newQty: number) => {
    setSelections((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const clampedQty = Math.max(1, Math.min(newQty, item.availableStock));
        return {
          ...item,
          qty: clampedQty,
          totalPrice: clampedQty * item.pricePerUnit,
        };
      })
    );
  };

  const selectedItems = selections.filter((item) => item.selected);
  const grandTotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleConfirm = () => {
    const finalItems: MedicineWithPrice[] = selectedItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.totalPrice,
    }));
    onConfirm(finalItems);
  };

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
              <h2 className="text-xl font-bold text-primary-foreground">Stock Availability</h2>
              <p className="text-primary-foreground/80 text-sm">Some items have limited stock</p>
            </div>
          </div>
        </div>

        {/* Medicine List */}
        <div className="p-6">
          <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Some medicines have less stock than requested. Select which ones to include.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {selections.map((item, index) => {
              const isPartial = item.availableStock < item.requestedQty;
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    item.selected
                      ? "bg-primary/5 border-primary/30"
                      : "bg-secondary border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleSelection(index)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Pill className="w-4 h-4 text-primary" />
                          </div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                        </div>
                        <p className="text-lg font-bold text-foreground">₹{item.totalPrice}</p>
                      </div>

                      {isPartial && (
                        <div className="bg-destructive/10 text-destructive text-sm px-2 py-1 rounded mb-2 inline-block">
                          Requested: {item.requestedQty} | Available: {item.availableStock}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          ₹{item.pricePerUnit} per unit
                        </p>
                        
                        {item.selected && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(index, item.qty - 1)}
                              disabled={item.qty <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.qty}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(index, item.qty + 1)}
                              disabled={item.qty >= item.availableStock}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          {selectedItems.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-muted-foreground">Grand Total</span>
                <span className="text-2xl font-bold text-primary">₹{grandTotal}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-14 text-lg font-semibold"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedItems.length === 0}
            className="flex-1 h-14 text-lg font-semibold shadow-button bg-accent hover:bg-accent/90"
          >
            <Check className="w-5 h-5 mr-2" />
            Proceed ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
