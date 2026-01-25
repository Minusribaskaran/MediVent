export interface Medicine {
  name: string;
  qty: number;
}

export interface MedicineWithPrice extends Medicine {
  pricePerUnit: number;
  totalPrice: number;
}

export interface QRData {
  medicines: Medicine[];
}

// Hardcoded medicine prices
export const MEDICINE_PRICES: Record<string, number> = {
  "Paracetamol": 20,
  "Amoxicillin": 50,
  "Cetirizine": 10,
};

export function getMedicinePrice(name: string): number | null {
  return MEDICINE_PRICES[name] ?? null;
}

export function calculateMedicineDetails(medicines: Medicine[]): {
  items: MedicineWithPrice[];
  grandTotal: number;
  unknownMedicines: string[];
} {
  const items: MedicineWithPrice[] = [];
  const unknownMedicines: string[] = [];
  let grandTotal = 0;

  for (const medicine of medicines) {
    const price = getMedicinePrice(medicine.name);
    if (price !== null) {
      const totalPrice = price * medicine.qty;
      items.push({
        name: medicine.name,
        qty: medicine.qty,
        pricePerUnit: price,
        totalPrice,
      });
      grandTotal += totalPrice;
    } else {
      unknownMedicines.push(medicine.name);
    }
  }

  return { items, grandTotal, unknownMedicines };
}

export function parseQRData(data: string): QRData | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed && Array.isArray(parsed.medicines)) {
      return parsed as QRData;
    }
    return null;
  } catch {
    return null;
  }
}
