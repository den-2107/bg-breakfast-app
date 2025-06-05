import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Header from "./components/Header";
import BreakfastTable from "./components/BreakfastTable";
import Modal from "./components/Modal";
import MenuEditor from "./components/MenuEditor";
import Kitchen from "./components/Kitchen";
import Reports from "./components/report/Reports";
import { MenuProvider } from "./components/MenuProvider";
import {
  loadOrdersByDate,
  saveOrder,
  updateOrder,
} from "./components/OrdersService";
import {
  loadTimeSlotsRaw
} from "./components/TimeSlotsService";

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
  const dateKey = selectedDate.toLocaleDateString("sv-SE");

  const [ordersByDate, setOrdersByDate] = useState({});
  const [timeByDate, setTimeByDate] = useState({});

  const [modalRoom, setModalRoom] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await loadOrdersByDate(dateKey);
        const slotsArray = await loadTimeSlotsRaw(dateKey);

        const groupedSlots = {};
        slotsArray.forEach((slot) => {
          groupedSlots[slot.room] = slot.time;
        });

        setOrdersByDate({ [dateKey]: orders });
        setTimeByDate({ [dateKey]: groupedSlots });
      } catch (error) {
        console.error("Ошибка загрузки заказов или слотов:", error);
        setOrdersByDate({ [dateKey]: {} });
        setTimeByDate({ [dateKey]: {} });
      }
    };

    fetchData();
  }, [dateKey]);

  useEffect(() => {
    localStorage.removeItem("selectedTab");
    localStorage.removeItem("selectedDate");
  }, []);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastShownDate = localStorage.getItem("shownTodayDate");

    if (lastShownDate !== todayStr) {
      localStorage.removeItem("shownTodaySlots");
      localStorage.setItem("shownTodayDate", todayStr);
    }
  }, []);

  const handleSave = async () => {
    if (!modalRoom || !modalData || isSavingRef.current) return;
    isSavingRef.current = true;

    const prepareForSave = (value) => {
      if (value && typeof value === "object") return value.id || value.name || "";
      return value || "";
    };

    const newOrder = {
      ...modalData,
      room: modalRoom,
      date: dateKey,
      dish1: prepareForSave(modalData.dish1),
      dish2: prepareForSave(modalData.dish2),
      drinks: prepareForSave(modalData.drinks),
      extras: (modalData.extras || []).map((item) =>
        typeof item === "object" ? item.name || "" : item
      ),
      comment: modalData.comment || "",
      urgent: !!modalData.urgent,
      time: modalData.time || "",
      toGo: modalData.toGo || false,
    };

    try {
      let savedOrder;

      if (modalData.id) {
        savedOrder = await updateOrder(modalData.id, newOrder);
      } else {
        savedOrder = await saveOrder(newOrder);
      }

      setOrdersByDate((prev) => {
        const updated = { ...prev };
        const byRoom = { ...(updated[dateKey] || {}) };
        const roomOrders = [...(byRoom[modalRoom] || [])];

        if (modalData.id) {
          const index = roomOrders.findIndex((o) => o.id === modalData.id);
          if (index !== -1) roomOrders[index] = savedOrder;
        } else {
          roomOrders.push(savedOrder);
        }

        byRoom[modalRoom] = roomOrders;
        updated[dateKey] = byRoom;
        return updated;
      });

      setModalRoom(null);
      setModalData(null);
    } catch (error) {
      console.error("Ошибка при сохранении заказа:", error);
      alert("Не удалось сохранить заказ");
    } finally {
      isSavingRef.current = false;
    }
  };

  return (
    <MenuProvider>
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
            orders={ordersByDate[dateKey] || {}}
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

        {currentPage === "reports" && <Reports />}

        {modalRoom && (
          <Modal
            room={modalRoom}
            data={modalData}
            setData={setModalData}
            onClose={() => setModalRoom(null)}
            onSave={handleSave}
            selectedDate={selectedDate}
            timeByDate={timeByDate}
            ordersByDate={ordersByDate}
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
    </MenuProvider>
  );
}
