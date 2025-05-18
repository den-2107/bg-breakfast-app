import React, { useEffect, useState, useRef } from "react";
import KitchenCard from "./KitchenCard";

export default function Kitchen({ selectedDate, ordersByDate, timeByDate, setOrdersByDate }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertSlot, setAlertSlot] = useState(null);
  const shownSlotsRef = useRef(new Set());

  const dateKey = selectedDate.toLocaleDateString("sv-SE");
  const orders = ordersByDate?.[dateKey] || {};
  const times = timeByDate?.[dateKey] || {};

  const TIME_SLOTS = [
    "07:30 - 08:00", "08:00 - 08:30", "08:30 - 09:00",
    "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00"
  ];

  const ordersBySlot = {
    "Не выбрано": [],
    ...Object.fromEntries(TIME_SLOTS.map((slot) => [slot, []])),
  };

  const isToGo = (val) => {
    if (val === undefined || val === null) return false;
    const v = typeof val === "string" ? val.toLowerCase().trim() : val;
    return v === true || v === "true" || v === "on" || v === "1" || v === 1;
  };

  const todayStr = new Date().toDateString();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("shownTodaySlots") || "[]");
      shownSlotsRef.current = new Set(saved);
    } catch {
      shownSlotsRef.current = new Set();
    }
  }, []);

  useEffect(() => {
    if (selectedDate.toDateString() !== todayStr) return;

    for (const [room, orderList] of Object.entries(orders)) {
      const hasTodayOrder = orderList?.some(order =>
        !isToGo(order?.toGo) &&
        order?.createdAt &&
        new Date(order.createdAt).toDateString() === todayStr
      );

      const slot = times?.[room] || "Не выбрано";

      if (hasTodayOrder && !shownSlotsRef.current.has(slot)) {
        setAlertSlot(slot);
        setShowAlert(true);
        break;
      }
    }
  }, [selectedDate, orders, times]);

  let totalRooms = 0;
  let totalOrders = 0;

  for (const [room, orderList] of Object.entries(orders)) {
    const filteredOrders = orderList.filter(order => !isToGo(order?.toGo));
    if (filteredOrders.length === 0) continue;

    totalRooms++;
    totalOrders += filteredOrders.length;

    const slot = times?.[room] || "Не выбрано";
    if (!ordersBySlot[slot]) ordersBySlot[slot] = [];
    ordersBySlot[slot].push([room, filteredOrders]);
  }

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {showAlert && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "24px 32px",
            borderRadius: "12px",
            maxWidth: "400px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
              Появился новый завтрак на слот {alertSlot || "Не выбрано"}
            </p>
            <button
              onClick={() => {
                setShowAlert(false);
                if (alertSlot) {
                  shownSlotsRef.current.add(alertSlot);
                  localStorage.setItem("shownTodaySlots", JSON.stringify([...shownSlotsRef.current]));
                }
              }}
              style={{
                fontSize: "14px",
                padding: "4px 10px",
                borderRadius: "4px",
                backgroundColor: "#fff",
                border: "1px solid #aaa",
                cursor: "pointer"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "12px", fontWeight: "bold", fontSize: "18px" }}>
        Завтраки: {totalRooms} номеров / {totalOrders} заказов
      </div>

      {Object.entries(ordersBySlot).map(([slot, roomEntries], idx) => {
        const sortedRooms = [...roomEntries].sort(([roomA, ordersA], [roomB, ordersB]) => {
          const hasUrgentA = ordersA.some((o) => o.urgent);
          const hasUrgentB = ordersB.some((o) => o.urgent);
          if (hasUrgentA && !hasUrgentB) return -1;
          if (!hasUrgentA && hasUrgentB) return 1;
          return roomA.localeCompare(roomB, "ru", { numeric: true });
        });

        return (
          <div key={slot} style={{ marginBottom: "24px" }}>
            {idx > 0 && (
              <div style={{
                height: "1px",
                backgroundColor: "#ccc",
                margin: "20px 0"
              }} />
            )}

            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              {slot}
            </h2>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "flex-start"
            }}>
              {sortedRooms.length > 0 ? (
                sortedRooms.map(([room, roomOrders]) => (
                  <div key={room} style={{ width: "300px" }}>
                    <KitchenCard
                      room={`${room} (${roomOrders.length} чел.)`}
                      orders={roomOrders}
                      isPriority={roomOrders.some((o) => o.urgent)}
                      selectedDate={selectedDate}
                      setOrdersByDate={setOrdersByDate}
                    />
                  </div>
                ))
              ) : (
                <div style={{ color: "#888", fontStyle: "italic", paddingLeft: "8px" }}>
                  Нет заказов в этом слоте
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
