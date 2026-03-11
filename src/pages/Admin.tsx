import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInventory,
  getUnacknowledgedNotifications,
  refillMedicine,
  refillAllMedicines,
  InventoryItem,
  AdminNotification,
} from "@/lib/inventoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Package,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
} from "lucide-react";

const ADMIN_PASSWORD = "project";

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const refreshData = () => {
    setInventory(getInventory());
    setNotifications(getUnacknowledgedNotifications());
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      // Poll for updates every 2 seconds
      const interval = setInterval(refreshData, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleRefillEmpty = (medicineName: string) => {
    refillMedicine(medicineName);
    refreshData();
  };

  const handleRefillAll = () => {
    refillAllMedicines();
    refreshData();
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
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
            <h1 className="text-2xl font-bold text-primary-foreground">
              Admin Login
            </h1>
            <div className="w-20" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-card p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Owner Access
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter password to view inventory
                </p>
              </div>

              <form onSubmit={handleLogin}>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-4 h-12 text-center text-lg"
                />
                {error && (
                  <p className="text-destructive text-sm text-center mb-4">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Access Dashboard
                </Button>
              </form>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // Admin dashboard
  const emptyMedicines = inventory.filter((item) => item.stock === 0);
  const hasEmptyStock = emptyMedicines.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <h1 className="text-2xl font-bold text-primary-foreground">
            Admin Dashboard
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Stock Alerts & Refill - Shows when ANY medicine is at 0 stock */}
          {hasEmptyStock && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-destructive">
                    Stock Alert!
                  </h2>
                  <p className="text-destructive/80 text-sm">
                    {emptyMedicines.length} medicine(s) out of stock
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {emptyMedicines.map((item) => (
                  <div
                    key={item.name}
                    className="bg-card rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Out of stock
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRefillEmpty(item.name)}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refilled Empty Medicine
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleRefillAll}
                className="w-full mt-4 h-12 font-semibold"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refilled All Medicines
              </Button>
            </div>
          )}

          {/* Inventory Status */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="bg-secondary px-6 py-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Inventory Status
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {inventory.map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between p-4 rounded-xl ${item.stock === 0
                    ? "bg-destructive/10 border border-destructive/20"
                    : "bg-secondary"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${item.stock === 0
                        ? "bg-destructive/20"
                        : "bg-primary/10"
                        }`}
                    >
                      {item.stock === 0 ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.pricePerUnit} per unit
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${item.stock === 0 ? "text-destructive" : "text-foreground"
                        }`}
                    >
                      {item.stock}
                    </p>
                    <p className="text-xs text-muted-foreground">in stock</p>
                  </div>
                </div>
              ))}
            </div>

            {!hasEmptyStock && (
              <div className="px-6 pb-6">
                <div className="bg-accent/10 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-accent font-semibold">All Stock Healthy</p>
                  <p className="text-sm text-muted-foreground">
                    No refills needed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Refill All - Always visible */}
          <Button
            onClick={handleRefillAll}
            className="w-full h-12 font-semibold bg-accent hover:bg-accent/90"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refill All Medicines
          </Button>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            onClick={refreshData}
            className="w-full h-12"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Data
          </Button>
        </div>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          ⚠️ Demo Mode: Data stored in localStorage
        </p>
      </footer>
    </div>
  );
}
