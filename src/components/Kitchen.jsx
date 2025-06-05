import React, { useEffect, useState, useRef } from "react";
import KitchenCard from "./KitchenCard";
import pb from "../pocketbase";
import { loadTimeSlotsByDate } from "./TimeSlotsService";

export default function Kitchen({ selectedDate, ordersByDate, timeByDate, setOrdersByDate }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertSlot, setAlertSlot] = useState(null);
  const shownRoomsRef = useRef(new Set());

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
      const saved = JSON.parse(localStorage.getItem("shownTodayRooms") || "[]");
      shownRoomsRef.current = new Set(saved);
    } catch {
      shownRoomsRef.current = new Set();
    }
  }, []);

  useEffect(() => {
    if (selectedDate.toDateString() !== todayStr) return;

    for (const [room, orderList] of Object.entries(orders)) {
      if (shownRoomsRef.current.has(room)) continue;

      const hasTodayOrder = orderList?.some(order => {
        const createdStr = order?.created;
        const isToday = createdStr && new Date(createdStr).toDateString() === todayStr;
        const notToGo = !isToGo(order?.toGo);
        return isToday && notToGo;
      });

      if (hasTodayOrder) {
        const slot = times?.[room] || "Не выбрано";
        setAlertSlot(slot);
        setShowAlert(true);
        shownRoomsRef.current.add(room);
        localStorage.setItem("shownTodayRooms", JSON.stringify([...shownRoomsRef.current]));
        break;
      }
    }
  }, [selectedDate, orders, times]);

  // ✅ Подписка на новые заказы с актуализацией слота и фильтром по ToGo
  useEffect(() => {
    if (selectedDate.toDateString() !== todayStr) return;

    const unsub = pb.collection("orders").subscribe("*", async (e) => {
      if (e.action === "create") {
        const newOrder = e.record;
        const createdDate = new Date(newOrder.created).toDateString();
        if (createdDate !== todayStr) return;

        const room = newOrder.room;
        const toGo = newOrder.toGo;

        if (shownRoomsRef.current.has(room)) return;
        if (toGo === true || toGo === "true" || toGo === "on" || toGo === 1 || toGo === "1") return;

        const updated = await pb.collection("orders").getFullList({
          filter: `date = "${selectedDate.toISOString().slice(0, 10)}"`,
          sort: "+created"
        });

        const grouped = {};
        for (const order of updated) {
          if (!grouped[order.room]) grouped[order.room] = [];
          grouped[order.room].push(order);
        }

        setOrdersByDate(prev => ({
          ...prev,
          [dateKey]: grouped
        }));

        setTimeout(async () => {
          const freshSlots = await loadTimeSlotsByDate(selectedDate.toISOString().slice(0, 10));
          const actualSlot = freshSlots?.[room] || "Не выбрано";
          setAlertSlot(actualSlot);
          setShowAlert(true);

          shownRoomsRef.current.add(room);
          localStorage.setItem("shownTodayRooms", JSON.stringify([...shownRoomsRef.current]));
        }, 40000);
      }
    });

    return () => {
      pb.collection("orders").unsubscribe("*");
    };
  }, [selectedDate, setOrdersByDate]);

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
              onClick={(e) => {
                e.preventDefault?.();
                setShowAlert(false);
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
