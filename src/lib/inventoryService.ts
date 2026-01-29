// Inventory management using localStorage for single-device demo

export interface InventoryItem {
  name: string;
  stock: number;
  pricePerUnit: number;
}

export interface AdminNotification {
  id: string;
  medicineName: string;
  timestamp: number;
  acknowledged: boolean;
}

const INVENTORY_KEY = "medivend_inventory";
const NOTIFICATIONS_KEY = "medivend_notifications";
const INITIAL_STOCK = 5;

// Initial inventory with 5 of each
const DEFAULT_INVENTORY: InventoryItem[] = [
  { name: "Paracetamol", stock: INITIAL_STOCK, pricePerUnit: 20 },
  { name: "Amoxicillin", stock: INITIAL_STOCK, pricePerUnit: 50 },
  { name: "Cetirizine", stock: INITIAL_STOCK, pricePerUnit: 10 },
];

// Initialize inventory if not exists
export function initializeInventory(): void {
  if (!localStorage.getItem(INVENTORY_KEY)) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(DEFAULT_INVENTORY));
  }
  if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  }
}

// Get current inventory
export function getInventory(): InventoryItem[] {
  initializeInventory();
  const data = localStorage.getItem(INVENTORY_KEY);
  return data ? JSON.parse(data) : DEFAULT_INVENTORY;
}

// Get medicines that are in stock (stock > 0)
export function getAvailableMedicines(): string[] {
  const inventory = getInventory();
  return inventory.filter((item) => item.stock > 0).map((item) => item.name);
}

// Check if a specific medicine is available
export function isMedicineAvailable(name: string): boolean {
  const inventory = getInventory();
  const item = inventory.find((i) => i.name === name);
  return item ? item.stock > 0 : false;
}

// Get stock for a specific medicine
export function getMedicineStock(name: string): number {
  const inventory = getInventory();
  const item = inventory.find((i) => i.name === name);
  return item ? item.stock : 0;
}

// Decrement stock after successful dispensing
export function decrementStock(medicineName: string, quantity: number): boolean {
  const inventory = getInventory();
  const itemIndex = inventory.findIndex((i) => i.name === medicineName);

  if (itemIndex === -1) return false;

  const currentStock = inventory[itemIndex].stock;
  if (currentStock < quantity) return false;

  inventory[itemIndex].stock = currentStock - quantity;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));

  // Check if stock is now 0 and create notification
  if (inventory[itemIndex].stock === 0) {
    createNotification(medicineName);
  }

  return true;
}

// Decrement multiple medicines at once
export function decrementMultipleStock(
  items: { name: string; qty: number }[]
): boolean {
  const inventory = getInventory();

  // First, validate all items have sufficient stock
  for (const item of items) {
    const invItem = inventory.find((i) => i.name === item.name);
    if (!invItem || invItem.stock < item.qty) {
      return false;
    }
  }

  // Then decrement all
  for (const item of items) {
    const invItem = inventory.find((i) => i.name === item.name);
    if (invItem) {
      invItem.stock -= item.qty;
      if (invItem.stock === 0) {
        createNotification(item.name);
      }
    }
  }

  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  return true;
}

// Get notifications
export function getNotifications(): AdminNotification[] {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : [];
}

// Get unacknowledged notifications
export function getUnacknowledgedNotifications(): AdminNotification[] {
  return getNotifications().filter((n) => !n.acknowledged);
}

// Create a notification when medicine reaches 0
function createNotification(medicineName: string): void {
  const notifications = getNotifications();

  // Check if there's already an unacknowledged notification for this medicine
  const existing = notifications.find(
    (n) => n.medicineName === medicineName && !n.acknowledged
  );
  if (existing) return;

  const newNotification: AdminNotification = {
    id: `${Date.now()}-${medicineName}`,
    medicineName,
    timestamp: Date.now(),
    acknowledged: false,
  };

  notifications.push(newNotification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Refill a specific medicine (sets stock back to 5)
export function refillMedicine(medicineName: string): void {
  const inventory = getInventory();
  const item = inventory.find((i) => i.name === medicineName);

  if (item) {
    item.stock = INITIAL_STOCK;
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }

  // Acknowledge related notifications
  acknowledgeNotificationsForMedicine(medicineName);
}

// Refill all medicines
export function refillAllMedicines(): void {
  const inventory = getInventory();
  for (const item of inventory) {
    item.stock = INITIAL_STOCK;
  }
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));

  // Acknowledge all notifications
  const notifications = getNotifications();
  for (const n of notifications) {
    n.acknowledged = true;
  }
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Acknowledge notifications for a specific medicine
function acknowledgeNotificationsForMedicine(medicineName: string): void {
  const notifications = getNotifications();
  for (const n of notifications) {
    if (n.medicineName === medicineName) {
      n.acknowledged = true;
    }
  }
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Clear all notifications (for admin use)
export function clearAllNotifications(): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
}

// Reset inventory to default (for testing)
export function resetInventory(): void {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(DEFAULT_INVENTORY));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
}
