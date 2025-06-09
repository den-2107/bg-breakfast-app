import React, { useEffect, useState } from "react";
import KitchenCard from "./KitchenCard";
import pb from "../pocketbase";
import { loadTimeSlotsByDate, loadTimeSlotsRaw } from "./TimeSlotsService";
import { loadOrdersByDate } from "./OrdersService";

export default function Kitchen({ selectedDate, ordersByDate, timeByDate, setOrdersByDate, setTimeByDate }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertSlot, setAlertSlot] = useState(null);

const dateKey = selectedDate.toISOString().slice(0, 10);

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

  const today = new Date();
  const todayStr = today.toDateString();
  const dateStr = selectedDate.toISOString().slice(0, 10);

  const fetchData = async () => {
    try {
      const freshOrdersRaw = await loadOrdersByDate(dateStr);

      // Строго фильтруем заказы по дате
      const freshOrders = {};
      for (const room in freshOrdersRaw) {
        const filtered = freshOrdersRaw[room].filter(
          (order) => order.date?.slice(0, 10) === dateStr
        );
        if (filtered.length > 0) {
          freshOrders[room] = filtered;
        }
      }

      const freshSlotsArray = await loadTimeSlotsRaw(dateStr);
      const groupedSlots = {};
      freshSlotsArray.forEach((slot) => {
        groupedSlots[slot.room] = slot.time;
      });

      setOrdersByDate((prev) => ({ ...prev, [dateKey]: freshOrders }));
      setTimeByDate((prev) => ({ ...prev, [dateKey]: groupedSlots }));
    } catch (error) {
      console.error("Ошибка при автозагрузке данных:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    const unsub = pb.collection("orders").subscribe("*", async (e) => {
      const roomKey = e.record.room.toLowerCase();
      const orderDateStr = e.record.date?.slice(0, 10);
      if (orderDateStr !== dateStr || isToGo(e.record.toGo)) return;

      if (e.action === "create") {
        setOrdersByDate((prev) => {
          const updated = { ...prev };
          const roomOrders = updated[dateKey]?.[e.record.room] || [];
          const updatedDate = {
            ...updated[dateKey],
            [e.record.room]: [...roomOrders, e.record],
          };
          return { ...updated, [dateKey]: updatedDate };
        });

const createdDate = new Date(e.record.created).toISOString().slice(0, 10);
const todayISO = new Date().toISOString().slice(0, 10);
if (createdDate === todayISO && orderDateStr === todayISO) {
          setTimeout(async () => {
            let actualSlot = "Не выбрано";
            for (let i = 0; i < 5; i++) {
              const freshSlots = await loadTimeSlotsByDate(dateStr);
              actualSlot = freshSlots?.[roomKey] || "Не выбрано";
              if (actualSlot !== "Не выбрано" && actualSlot.toLowerCase() !== "to go") break;
              await new Promise((res) => setTimeout(res, 1000));
            }

            if (actualSlot.toLowerCase() !== "to go") {
              setAlertSlot(actualSlot);
              setShowAlert(true);
            }
          }, 2000);
        }
      }

      if (e.action === "update") {
        setOrdersByDate((prev) => {
          const updated = { ...prev };
          const current = updated[dateKey]?.[e.record.room] || [];
          const updatedRoomOrders = current.map((o) => o.id === e.record.id ? e.record : o);
          return {
            ...updated,
            [dateKey]: {
              ...updated[dateKey],
              [e.record.room]: updatedRoomOrders,
            },
          };
        });
      }

      if (e.action === "delete") {
        setOrdersByDate((prev) => {
          const updated = { ...prev };
          const current = updated[dateKey]?.[e.record.room] || [];
          const filtered = current.filter((o) => o.id !== e.record.id);
          const updatedDate = { ...updated[dateKey], [e.record.room]: filtered };
          return { ...updated, [dateKey]: updatedDate };
        });
      }
    });

    return () => pb.collection("orders").unsubscribe("*");
  }, [selectedDate]);

  let totalRooms = 0;
  let totalOrders = 0;

  for (const [room, orderList] of Object.entries(orders)) {
    const filteredOrders = orderList.filter((order) => !isToGo(order?.toGo));
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
                localStorage.setItem("selectedTab", "kitchen");
                localStorage.setItem("selectedDate", selectedDate.toISOString());
                window.location.reload();
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
