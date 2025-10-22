import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Phone,
  User,
  Clock,
  CheckCircle,
  Lock,
  LogOut,
} from "lucide-react";

// TEK ŞİFRE TANIMLAMASI
const SINGLE_PASSWORD = "kokorec2025";

const EnfesKokorec = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ password: "" });
  const [loginError, setLoginError] = useState("");

  // ROL VE TAB AKSİYONLARI KALDIRILDIĞI İÇİN SADECE DURUM VE ERİŞİM KONTROLÜ VAR
  const userRole = "Yönetici"; // Sabitlendi
  const canAccessTab = () => true; // Tüm sekmeler erişilebilir

  const [activeTab, setActiveTab] = useState("siparis");
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([
    { id: 1, name: "Kokoreç Porsiyon", price: 150, category: "Yiyecekler" },
    { id: 2, name: "Kokoreç Dürüm", price: 120, category: "Yiyecekler" },
    { id: 3, name: "Ayran", price: 20, category: "İçecekler" },
    { id: 4, name: "Kola", price: 30, category: "İçecekler" },
    { id: 5, name: "Patates Kızartması", price: 40, category: "Yan Ürünler" },
  ]);
  const [orders, setOrders] = useState([]);
  const [packages, setPackages] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentType, setPaymentType] = useState("Nakit");
  const [orderNote, setOrderNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [showMenuEdit, setShowMenuEdit] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Malzeme",
  });
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState({
    customerName: "",
    phone: "",
    note: "",
  });

  // Verileri localStorage'dan yükle
  useEffect(() => {
    const savedOrders = localStorage.getItem("enfes_orders");
    const savedPackages = localStorage.getItem("enfes_packages");
    const savedExpenses = localStorage.getItem("enfes_expenses");
    const savedMenu = localStorage.getItem("enfes_menu");
    const savedTables = localStorage.getItem("enfes_tables");

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedPackages) setPackages(JSON.parse(savedPackages));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedMenu) setMenu(JSON.parse(savedMenu));

    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      const insideTables = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        location: "İçeri",
        status: "bos",
        orders: [],
        startTime: null,
      }));
      const outsideTables = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        location: "Dışarı",
        status: "bos",
        orders: [],
        startTime: null,
      }));
      setTables([...insideTables, ...outsideTables]);
    }
  }, []);

  // Verileri localStorage'a kaydet
  useEffect(() => {
    if (orders.length > 0)
      localStorage.setItem("enfes_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (packages.length > 0)
      localStorage.setItem("enfes_packages", JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    if (expenses.length > 0)
      localStorage.setItem("enfes_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    if (menu.length > 0)
      localStorage.setItem("enfes_menu", JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    if (tables.length > 0)
      localStorage.setItem("enfes_tables", JSON.stringify(tables));
  }, [tables]);

  const handleLogin = (e) => {
    e.preventDefault();

    // Tek şifre kontrolü
    if (loginForm.password === SINGLE_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
      setLoginForm({ password: "" });
    } else {
      setLoginError("Şifre hatalı! Lütfen doğru şifreyi giriniz.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("siparis");
  };

  const addToOrder = (item) => {
    const existing = currentOrder.find((o) => o.id === item.id);
    if (existing) {
      setCurrentOrder(
        currentOrder.map((o) =>
          o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
        )
      );
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCurrentOrder(currentOrder.filter((o) => o.id !== itemId));
    } else {
      setCurrentOrder(
        currentOrder.map((o) =>
          o.id === itemId ? { ...o, quantity: newQuantity } : o
        )
      );
    }
  };

  const calculateTotal = (orderItems = currentOrder, disc = discount) => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return subtotal * (1 - disc / 100);
  };

  const completeOrder = () => {
    if (!selectedTable || currentOrder.length === 0) return;

    const total = calculateTotal();
    const newOrder = {
      id: Date.now(),
      tableId: selectedTable.id,
      location: selectedTable.location,
      items: currentOrder,
      total,
      discount,
      paymentType,
      note: orderNote,
      waiter: userRole,
      timestamp: new Date(),
    };

    setOrders([...orders, newOrder]);
    setTables(
      tables.map((t) =>
        t.id === selectedTable.id && t.location === selectedTable.location
          ? { ...t, status: "bos", orders: [], startTime: null }
          : t
      )
    );
    setCurrentOrder([]);
    setDiscount(0);
    setPaymentType("Nakit");
    setOrderNote("");
    setSelectedTable(null);
    setEditingTable(null);
  };

  const selectTable = (table) => {
    if (table.status === "dolu" && !editingTable) {
      setEditingTable(table);
      setCurrentOrder([...table.orders]);
      setDiscount(0);
      setSelectedTable(table);
    } else if (table.status === "bos") {
      setSelectedTable(table);
      setCurrentOrder([]);
      setDiscount(0);
      setPaymentType("Nakit");
      setOrderNote("");
      setTables(
        tables.map((t) =>
          t.id === table.id && t.location === table.location
            ? { ...t, status: "dolu", startTime: new Date() }
            : t
        )
      );
    }
  };

  const updateTableOrder = () => {
    if (!editingTable || currentOrder.length === 0) return;

    setTables(
      tables.map((t) =>
        t.id === editingTable.id && t.location === editingTable.location
          ? { ...t, orders: [...currentOrder] }
          : t
      )
    );
    setEditingTable(null);
    setSelectedTable(null);
    setCurrentOrder([]);
  };

  const saveMenuItem = (item) => {
    if (item.id) {
      setMenu(menu.map((m) => (m.id === item.id ? item : m)));
    } else {
      setMenu([...menu, { ...item, id: Date.now() }]);
    }
    setEditingItem(null);
    setShowMenuEdit(false);
  };

  const deleteMenuItem = (id) => {
    setMenu(menu.filter((m) => m.id !== id));
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      setExpenses([
        ...expenses,
        {
          id: Date.now(),
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          date: new Date(),
        },
      ]);
      setNewExpense({ description: "", amount: "", category: "Malzeme" });
      setShowExpenseModal(false);
    }
  };

  const createPackage = () => {
    if (
      !packageForm.customerName ||
      !packageForm.phone ||
      currentOrder.length === 0
    )
      return;

    const total = calculateTotal();
    const newPackage = {
      id: Date.now(),
      ...packageForm,
      items: currentOrder,
      total,
      discount,
      paymentType,
      status: "Hazırlanıyor",
      waiter: userRole,
      timestamp: new Date(),
    };

    setPackages([...packages, newPackage]);
    setOrders([
      ...orders,
      { ...newPackage, tableId: "Paket", location: "Paket" },
    ]);
    setCurrentOrder([]);
    setDiscount(0);
    setPaymentType("Nakit");
    setPackageForm({ customerName: "", phone: "", note: "" });
    setShowPackageModal(false);
  };

  const updatePackageStatus = (id, newStatus) => {
    setPackages(
      packages.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const getStats = (period) => {
    const now = new Date();
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.timestamp);
      if (period === "gunluk")
        return orderDate.toDateString() === now.toDateString();
      if (period === "haftalik") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      }
      if (period === "aylik") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "yillik") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const revenue = filtered.reduce((sum, order) => sum + order.total, 0);

    const expenseFiltered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      if (period === "gunluk")
        return expenseDate.toDateString() === now.toDateString();
      if (period === "haftalik") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      }
      if (period === "aylik") {
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "yillik") {
        return expenseDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const totalExpenses = expenseFiltered.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const profit = revenue - totalExpenses;

    return { revenue, totalExpenses, profit, orderCount: filtered.length };
  };

  const getBestSellers = () => {
    const itemStats = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (itemStats[item.name]) {
          itemStats[item.name] += item.quantity;
        } else {
          itemStats[item.name] = item.quantity;
        }
      });
    });
    return Object.entries(itemStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = orders.filter(
        (o) => new Date(o.timestamp).toDateString() === date.toDateString()
      );
      const dayExpenses = expenses.filter(
        (e) => new Date(e.date).toDateString() === date.toDateString()
      );
      data.push({
        date: date.toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
        }),
        ciro: dayOrders.reduce((sum, o) => sum + o.total, 0),
        masraf: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }
    return data;
  };

  const downloadExcel = () => {
    const stats = getStats("aylik");
    let csv = "Enfes Kokoreç Otomasyon - Aylık Rapor\n\n";
    csv += "Özet\n";
    csv += `Toplam Ciro,${stats.revenue.toFixed(2)} TL\n`;
    csv += `Toplam Masraf,${stats.totalExpenses.toFixed(2)} TL\n`;
    csv += `Net Kar,${stats.profit.toFixed(2)} TL\n`;
    csv += `Sipariş Sayısı,${stats.orderCount}\n\n`;

    csv += "En Çok Satanlar\n";
    csv += "Ürün,Adet\n";
    getBestSellers().forEach((item) => {
      csv += `${item.name},${item.count}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "enfes-kokorec-rapor.csv";
    link.click();
  };

  const getTableDuration = (table) => {
    if (!table.startTime) return "";
    const now = new Date();
    const diff = Math.floor((now - new Date(table.startTime)) / 1000 / 60);
    return `${diff} dk`;
  };

  const filteredMenu =
    selectedCategory === "Tümü"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  const dailyStats = getStats("gunluk");
  const bestSellers = getBestSellers();
  const chartData = getChartData();

  const categories = [
    "Tümü",
    "Yiyecekler",
    "İçecekler",
    "Yan Ürünler",
    "Tatlı",
  ];

  // Giriş ekranı (Kullanıcı adı kaldırıldı, tek şifre kaldı)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🥙 Enfes Kokoreç
            </h1>
            <p className="text-gray-600">Otomasyon Sistemi - Tek Giriş</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Şifre
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                placeholder="Şifreniz"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
            >
              Giriş Yap
            </button>
          </form>

          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Tek Şifre:
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <div>
                🔑 <strong>kokorec2025</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ana sistem (Tüm sekmeler herkes için erişilebilir)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  🥙 Enfes Kokoreç Otomasyon Sistemi
                </h1>
                <p className="text-orange-100">Profesyonel işletme yönetimi</p>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg mb-2">
                  <div className="text-sm opacity-90">Giriş Yapan</div>
                  <div className="font-bold">{userRole}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  <LogOut size={18} />
                  Çıkış
                </button>
              </div>
            </div>
          </div>

          <div className="flex border-b bg-gray-50 overflow-x-auto">
            {["siparis", "paket", "raporlar", "menu", "masraflar"].map(
              (tab) => {
                // if (!canAccessTab(tab)) return null; <-- Artık buna gerek yok
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-white text-orange-600 border-b-4 border-orange-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab === "siparis" && "📋 Sipariş"}
                    {tab === "paket" && "📦 Paket Servis"}
                    {tab === "raporlar" && "📊 Raporlar"}
                    {tab === "menu" && "🍴 Menü"}
                    {tab === "masraflar" && "💰 Masraflar"}
                  </button>
                );
              }
            )}
          </div>

          <div className="p-6">
            {activeTab === "siparis" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      🏠 İçeri Masalar (1-6)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tables
                        .filter((t) => t.location === "İçeri")
                        .map((table) => (
                          <button
                            key={`iceri-${table.id}`}
                            onClick={() => selectTable(table)}
                            className={`p-4 rounded-xl font-semibold transition-all ${
                              selectedTable?.id === table.id &&
                              selectedTable?.location === table.location
                                ? "ring-4 ring-orange-400"
                                : ""
                            } ${
                              table.status === "bos"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            <div className="text-lg">Masa {table.id}</div>
                            <div className="text-sm">
                              {table.status === "bos" ? "✓ Boş" : "● Dolu"}
                            </div>
                            {table.status === "dolu" && (
                              <div className="text-xs mt-1 flex items-center justify-center gap-1">
                                <Clock size={12} />
                                {getTableDuration(table)}
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      🌳 Dışarı Masalar (1-5)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tables
                        .filter((t) => t.location === "Dışarı")
                        .map((table) => (
                          <button
                            key={`disari-${table.id}`}
                            onClick={() => selectTable(table)}
                            className={`p-4 rounded-xl font-semibold transition-all ${
                              selectedTable?.id === table.id &&
                              selectedTable?.location === table.location
                                ? "ring-4 ring-orange-400"
                                : ""
                            } ${
                              table.status === "bos"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            <div className="text-lg">Masa {table.id}</div>
                            <div className="text-sm">
                              {table.status === "bos" ? "✓ Boş" : "● Dolu"}
                            </div>
                            {table.status === "dolu" && (
                              <div className="text-xs mt-1 flex items-center justify-center gap-1">
                                <Clock size={12} />
                                {getTableDuration(table)}
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {selectedTable && (
                    <div>
                      <h2 className="text-xl font-bold mb-3 text-gray-800">
                        Menü - Masa {selectedTable.id} ({selectedTable.location}
                        )
                      </h2>
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                              selectedCategory === cat
                                ? "bg-orange-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {filteredMenu.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => addToOrder(item)}
                            className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all text-left border-2 border-orange-200 hover:border-orange-400"
                          >
                            <div className="font-semibold text-gray-800">
                              {item.name}
                            </div>
                            <div className="text-orange-600 font-bold">
                              {item.price}₺
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.category}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Sipariş Özeti
                  </h2>
                  {currentOrder.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <Package className="mx-auto mb-2" size={48} />
                      <p>Sipariş eklenmedi</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentOrder.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.price}₺ x {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="border-t pt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            İskonto (%)
                          </label>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) =>
                              setDiscount(
                                Math.max(
                                  0,
                                  Math.min(100, parseFloat(e.target.value) || 0)
                                )
                              )
                            }
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            min="0"
                            max="100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Ödeme Tipi
                          </label>
                          <select
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          >
                            <option value="Nakit">💵 Nakit</option>
                            <option value="Kredi Kartı">💳 Kredi Kartı</option>
                            <option value="QR Kod">📱 QR Kod</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Sipariş Notu
                          </label>
                          <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            rows="2"
                            placeholder="Özel istekler..."
                          />
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span>Ara Toplam:</span>
                            <span>
                              {currentOrder
                                .reduce(
                                  (sum, item) =>
                                    sum + item.price * item.quantity,
                                  0
                                )
                                .toFixed(2)}
                              ₺
                            </span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-red-600 mb-1">
                              <span>İskonto ({discount}%):</span>
                              <span>
                                -
                                {(
                                  (currentOrder.reduce(
                                    (sum, item) =>
                                      sum + item.price * item.quantity,
                                    0
                                  ) *
                                    discount) /
                                  100
                                ).toFixed(2)}
                                ₺
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-xl font-bold text-orange-600 border-t pt-2">
                            <span>TOPLAM:</span>
                            <span>{calculateTotal().toFixed(2)}₺</span>
                          </div>
                        </div>

                        {editingTable ? (
                          <button
                            onClick={updateTableOrder}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                          >
                            ✏️ Masa Siparişini Güncelle
                          </button>
                        ) : (
                          <button
                            onClick={completeOrder}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                          >
                            ✓ Hesabı Kapat
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "paket" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    📦 Paket Servis
                  </h2>
                  <button
                    onClick={() => setShowPackageModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> Yeni Paket Sipariş
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-12">
                      <Package size={48} className="mx-auto mb-2" />
                      <p>Henüz paket sipariş yok</p>
                    </div>
                  ) : (
                    packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                              <User size={18} />
                              {pkg.customerName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Phone size={14} />
                              {pkg.phone}
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              pkg.status === "Hazırlanıyor"
                                ? "bg-yellow-100 text-yellow-700"
                                : pkg.status === "Hazır"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {pkg.status}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm mb-3">
                          {pkg.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-gray-600"
                            >
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                              <span>
                                {(item.price * item.quantity).toFixed(0)}₺
                              </span>
                            </div>
                          ))}
                        </div>

                        {pkg.note && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-3">
                            📝 {pkg.note}
                          </div>
                        )}

                        <div className="border-t pt-3 mb-3">
                          <div className="flex justify-between font-bold text-purple-600">
                            <span>Toplam:</span>
                            <span>{pkg.total.toFixed(2)}₺</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {pkg.paymentType} •{" "}
                            {new Date(pkg.timestamp).toLocaleString("tr-TR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {pkg.status === "Hazırlanıyor" && (
                            <button
                              onClick={() =>
                                updatePackageStatus(pkg.id, "Hazır")
                              }
                              className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 text-sm"
                            >
                              ✓ Hazır
                            </button>
                          )}
                          {pkg.status === "Hazır" && (
                            <button
                              onClick={() =>
                                updatePackageStatus(pkg.id, "Teslim Edildi")
                              }
                              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 text-sm"
                            >
                              📦 Teslim Et
                            </button>
                          )}
                          {pkg.status === "Teslim Edildi" && (
                            <div className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-center text-sm font-semibold">
                              <CheckCircle className="inline mr-1" size={16} />
                              Tamamlandı
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {showPackageModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                      <h3 className="text-2xl font-bold mb-6 text-gray-800">
                        Yeni Paket Sipariş
                      </h3>

                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                              Müşteri Adı
                            </label>
                            <input
                              type="text"
                              value={packageForm.customerName}
                              onChange={(e) =>
                                setPackageForm({
                                  ...packageForm,
                                  customerName: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                              placeholder="Ad Soyad"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                              Telefon
                            </label>
                            <input
                              type="tel"
                              value={packageForm.phone}
                              onChange={(e) =>
                                setPackageForm({
                                  ...packageForm,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                              placeholder="05XX XXX XX XX"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Sipariş Notu
                          </label>
                          <textarea
                            value={packageForm.note}
                            onChange={(e) =>
                              setPackageForm({
                                ...packageForm,
                                note: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            rows="2"
                            placeholder="Özel istekler..."
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-bold text-gray-800 mb-3">
                          Ürünler
                        </h4>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {menu.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => addToOrder(item)}
                              className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all text-left border-2 border-purple-200 hover:border-purple-400"
                            >
                              <div className="font-semibold text-gray-800 text-sm">
                                {item.name}
                              </div>
                              <div className="text-purple-600 font-bold">
                                {item.price}₺
                              </div>
                            </button>
                          ))}
                        </div>

                        {currentOrder.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            {currentOrder.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm font-medium text-gray-700">
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                    className="w-7 h-7 bg-red-100 text-red-600 rounded hover:bg-red-200 font-bold text-sm"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center font-bold text-sm">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="w-7 h-7 bg-green-100 text-green-600 rounded hover:bg-green-200 font-bold text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                              İskonto (%)
                            </label>
                            <input
                              type="number"
                              value={discount}
                              onChange={(e) =>
                                setDiscount(
                                  Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      parseFloat(e.target.value) || 0
                                    )
                                  )
                                )
                              }
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                              Ödeme Tipi
                            </label>
                            <select
                              value={paymentType}
                              onChange={(e) => setPaymentType(e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            >
                              <option value="Nakit">💵 Nakit</option>
                              <option value="Kredi Kartı">
                                💳 Kredi Kartı
                              </option>
                              <option value="QR Kod">📱 QR Kod</option>
                            </select>
                          </div>
                        </div>

                        {currentOrder.length > 0 && (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex justify-between text-xl font-bold text-purple-600">
                              <span>TOPLAM:</span>
                              <span>{calculateTotal().toFixed(2)}₺</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={createPackage}
                          disabled={
                            !packageForm.customerName ||
                            !packageForm.phone ||
                            currentOrder.length === 0
                          }
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✓ Paket Oluştur
                        </button>
                        <button
                          onClick={() => {
                            setShowPackageModal(false);
                            setPackageForm({
                              customerName: "",
                              phone: "",
                              note: "",
                            });
                            setCurrentOrder([]);
                            setDiscount(0);
                            setPaymentType("Nakit");
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "raporlar" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    📊 Raporlar & Analiz
                  </h2>
                  <button
                    onClick={downloadExcel}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> Excel İndir
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {["gunluk", "haftalik", "aylik", "yillik"].map((period) => {
                    const stats = getStats(period);
                    return (
                      <div
                        key={period}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200"
                      >
                        <div className="text-sm font-semibold text-blue-600 uppercase mb-2">
                          {period === "gunluk" && "📅 Günlük"}
                          {period === "haftalik" && "📊 Haftalık"}
                          {period === "aylik" && "📈 Aylık"}
                          {period === "yillik" && "🎯 Yıllık"}
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-gray-800">
                            {stats.revenue.toFixed(0)}₺
                          </div>
                          <div className="text-sm text-gray-600">Ciro</div>
                          <div className="text-sm text-red-600">
                            Masraf: {stats.totalExpenses.toFixed(0)}₺
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              stats.profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            Kar: {stats.profit.toFixed(0)}₺
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.orderCount} sipariş
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">
                      📈 Son 7 Gün Ciro & Masraf
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="ciro"
                          stroke="#f97316"
                          strokeWidth={3}
                          name="Ciro"
                        />
                        <Line
                          type="monotone"
                          dataKey="masraf"
                          stroke="#ef4444"
                          strokeWidth={3}
                          name="Masraf"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">
                      🏆 En Çok Satan Ürünler
                    </h3>
                    {bestSellers.length > 0 ? (
                      <div className="space-y-3">
                        {bestSellers.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.count} adet
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-12">
                        Henüz satış yok
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    💰 Günlük Özet
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        Toplam Ciro
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {dailyStats.revenue.toFixed(0)}₺
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        Toplam Masraf
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {dailyStats.totalExpenses.toFixed(0)}₺
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className={`text-sm text-gray-600 mb-1`}>
                        Net Kar
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          dailyStats.profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {dailyStats.profit.toFixed(0)}₺
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "menu" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Menü Yönetimi
                  </h2>
                  <button
                    onClick={() => {
                      setEditingItem({
                        name: "",
                        price: "",
                        category: "Yiyecekler",
                      });
                      setShowMenuEdit(true);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> Yeni Ürün
                  </button>
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 hover:border-orange-300 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowMenuEdit(true);
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {item.price}₺
                      </div>
                    </div>
                  ))}
                </div>

                {showMenuEdit && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                      <h3 className="text-2xl font-bold mb-6 text-gray-800">
                        {editingItem?.id ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Ürün Adı
                          </label>
                          <input
                            type="text"
                            value={editingItem?.name || ""}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Fiyat (₺)
                          </label>
                          <input
                            type="number"
                            value={editingItem?.price || ""}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                price: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Kategori
                          </label>
                          <select
                            value={editingItem?.category || "Yiyecekler"}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          >
                            <option value="Yiyecekler">Yiyecekler</option>
                            <option value="İçecekler">İçecekler</option>
                            <option value="Yan Ürünler">Yan Ürünler</option>
                            <option value="Tatlı">Tatlı</option>
                          </select>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => saveMenuItem(editingItem)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => {
                              setShowMenuEdit(false);
                              setEditingItem(null);
                            }}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "masraflar" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Masraf Yönetimi
                  </h2>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 flex items-center gap-2"
                  >
                    <Plus size={20} /> Yeni Masraf
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {["Malzeme", "Personel", "Kira", "Diğer"].map((category) => {
                    const categoryExpenses = expenses.filter(
                      (e) => e.category === category
                    );
                    const total = categoryExpenses.reduce(
                      (sum, e) => sum + e.amount,
                      0
                    );
                    return (
                      <div
                        key={category}
                        className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border-2 border-red-200"
                      >
                        <div className="text-sm font-semibold text-red-600 mb-1">
                          {category}
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {total.toFixed(0)}₺
                        </div>
                        <div className="text-xs text-gray-500">
                          {categoryExpenses.length} kayıt
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Tarih
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Açıklama
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Kategori
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                          Tutar
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                          İşlem
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-12 text-center text-gray-400"
                          >
                            Henüz masraf kaydı yok
                          </td>
                        </tr>
                      ) : (
                        expenses
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(expense.date).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                {expense.description}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                  {expense.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">
                                {expense.amount.toFixed(2)}₺
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() =>
                                    setExpenses(
                                      expenses.filter(
                                        (e) => e.id !== expense.id
                                      )
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {showExpenseModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                      <h3 className="text-2xl font-bold mb-6 text-gray-800">
                        Yeni Masraf Ekle
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Açıklama
                          </label>
                          <input
                            type="text"
                            value={newExpense.description}
                            onChange={(e) =>
                              setNewExpense({
                                ...newExpense,
                                description: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                            placeholder="Masraf açıklaması"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) =>
                              setNewExpense({
                                ...newExpense,
                                amount: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Kategori
                          </label>
                          <select
                            value={newExpense.category}
                            onChange={(e) =>
                              setNewExpense({
                                ...newExpense,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                          >
                            <option value="Malzeme">Malzeme</option>
                            <option value="Personel">Personel</option>
                            <option value="Kira">Kira</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={addExpense}
                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => {
                              setShowExpenseModal(false);
                              setNewExpense({
                                description: "",
                                amount: "",
                                category: "Malzeme",
                              });
                            }}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnfesKokorec;
