import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Header from "./components/Header";
import BreakfastTable from "./components/BreakfastTable";
import Modal from "./components/Modal";
import MenuEditor from "./components/MenuEditor";
import Kitchen from "./components/Kitchen";

const ROOMS = [
  "A2", "A4",
  ...Array.from({ length: 26 }, (_, i) => (i + 1).toString()),
  "Княжеский", "Царский"
];

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("selectedTab") || "breakfasts";
  });

  const [kitchenDate, setKitchenDate] = useState(() => {
    const saved = localStorage.getItem("selectedDate");
    return saved ? new Date(saved) : new Date();
  });

  const [breakfastDate, setBreakfastDate] = useState(() => {
    const saved = localStorage.getItem("selectedDate");
    if (saved) return new Date(saved);
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });

  const selectedDate = currentPage === "kitchen" ? kitchenDate : breakfastDate;

  const [ordersByDate, setOrdersByDate] = useState(() => {
    try {
      const saved = localStorage.getItem("ordersByDate");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [timeByDate, setTimeByDate] = useState(() => {
    try {
      const saved = localStorage.getItem("timeByDate");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [modalRoom, setModalRoom] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const isSavingRef = useRef(false);

  const dateKey = selectedDate.toLocaleDateString("sv-SE");

  useEffect(() => {
    localStorage.setItem("ordersByDate", JSON.stringify(ordersByDate));
  }, [ordersByDate]);

  useEffect(() => {
    localStorage.setItem("timeByDate", JSON.stringify(timeByDate));
  }, [timeByDate]);

  // После загрузки убираем сохранённую вкладку и дату, чтобы не сохранялись навсегда
  useEffect(() => {
    localStorage.removeItem("selectedTab");
    localStorage.removeItem("selectedDate");
  }, []);

  const handleSave = () => {
    if (isSavingRef.current || !modalRoom || !dateKey) return;
    isSavingRef.current = true;

    setOrdersByDate(prev => {
      const updated = { ...prev };
      if (!updated[dateKey]) updated[dateKey] = {};
      const currentOrders = updated[dateKey][modalRoom] || [];

      const newOrder = { ...modalData };
      delete newOrder.index;

      const normalize = (order) => ({
        dish1: order.dish1 || "",
        dish2: order.dish2 || "",
        drinks: order.drinks || "",
        comment: order.comment || "",
        extras: (order.extras || []).slice().sort(),
        toGo: !!order.toGo,
        urgent: !!order.urgent
      });

      const normalizedNew = normalize(newOrder);

      if (typeof modalData.index === "number") {
        currentOrders[modalData.index] = {
          ...normalizedNew,
          createdAt: currentOrders[modalData.index]?.createdAt || new Date().toISOString(),
          status: currentOrders[modalData.index]?.status || "ожидается"
        };
      } else {
        const last = currentOrders.slice(-1)[0];
        const normalizedLast = normalize(last || {});
        const isDuplicate = JSON.stringify(normalizedLast) === JSON.stringify(normalizedNew);
        if (!isDuplicate) {
          currentOrders.push({
            ...normalizedNew,
            createdAt: new Date().toISOString(),
            status: "ожидается"
          });
        }
      }

      updated[dateKey][modalRoom] = currentOrders;
      return updated;
    });

    setModalRoom(null);
    setModalData(null);
    setTimeout(() => {
      isSavingRef.current = false;
    }, 300);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", padding: 20 }}>
      <Header
        currentPage={currentPage}
        onSwitchPage={setCurrentPage}
        selectedDate={selectedDate}
        setSelectedDate={currentPage === "kitchen" ? setKitchenDate : setBreakfastDate}
        onEditMenu={() => setShowMenuEditor(true)}
      />

      {currentPage === "breakfasts" && (
        <BreakfastTable
          selectedDate={breakfastDate}
          timeByDate={timeByDate}
          setTimeByDate={setTimeByDate}
          setOrdersByDate={setOrdersByDate}
          setModalRoom={setModalRoom}
          setModalData={setModalData}
          rooms={ROOMS}
          orders={ordersByDate[breakfastDate.toLocaleDateString("sv-SE")] || {}}
          onAddClick={(roomName) => {
            setModalRoom(roomName);
            setModalData({});
          }}
        />
      )}

      {currentPage === "kitchen" && (
        <Kitchen
          selectedDate={kitchenDate}
          ordersByDate={ordersByDate}
          timeByDate={timeByDate}
          setOrdersByDate={setOrdersByDate}
        />
      )}

      {modalRoom && (
        <Modal
          room={modalRoom}
          data={modalData}
          setData={setModalData}
          onClose={() => setModalRoom(null)}
          onSave={handleSave}
        />
      )}

      {showMenuEditor && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "#fff", padding: 20, maxWidth: "600px",
            width: "100%", maxHeight: "90vh", overflowY: "auto",
            borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}>
            <MenuEditor onClose={() => setShowMenuEditor(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
