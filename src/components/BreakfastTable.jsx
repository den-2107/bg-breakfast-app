// ===== BreakfastTable.jsx =====
import React, { useEffect } from "react";
import RoomRow from "./RoomRow";
import pb from "../pocketbase"; // ✅ подключаем PocketBase

export default function BreakfastTable({
  rooms,
  orders,
  onAddClick,
  selectedDate,
  timeByDate,
  setTimeByDate,
  setOrdersByDate,
  setModalRoom,
  setModalData
}) {
  // 👇 добавляем переменную ordersByDate для передачи в RoomRow
  const ordersByDate = orders;

  const roomsWithOrders = Object.keys(orders).filter(
    (room) => (orders[room] || []).length > 0
  );
  const totalOrders = roomsWithOrders.reduce(
    (sum, room) => sum + orders[room].length,
    0
  );

  console.log("orders", orders);
  console.log("selectedDate", selectedDate);

  useEffect(() => {
    const dateStr = selectedDate.toISOString().slice(0, 10);

    const unsub = pb.collection("orders").subscribe("*", (e) => {
      if (e.action !== "update") return;

      const orderDate = e.record.date?.slice(0, 10);
      if (orderDate !== dateStr) return;

      setOrdersByDate(prev => {
        const updated = { ...prev };
        const room = e.record.room;
        const current = updated[room] || [];

        const updatedRoom = current.map(order =>
          order.id === e.record.id ? { ...order, ...e.record } : order
        );

        return {
          ...updated,
          [room]: updatedRoom
        };
      });
    });

    return () => pb.collection("orders").unsubscribe("*");
  }, [selectedDate]);

  return (
    <div>
      <div
        style={{
          marginBottom: "12px",
          fontWeight: "bold",
          fontSize: "18px",
          paddingLeft: "0px",
          textAlign: "left"
        }}
      >
        Завтраки: {roomsWithOrders.length} номеров / {totalOrders} заказов
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "2px solid #ccc",
                padding: "8px",
                fontSize: "16px",
                textAlign: "left"
              }}
            >
              Номер
            </th>
            <th
              style={{
                borderBottom: "2px solid #ccc",
                padding: "8px",
                fontSize: "16px",
                textAlign: "left"
              }}
            >
              Время
            </th>
            <th
              style={{
                borderBottom: "2px solid #ccc",
                padding: "8px",
                fontSize: "16px",
                textAlign: "left"
              }}
            >
              Завтрак
            </th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <RoomRow
              key={room}
              room={room}
              orders={orders[room] || []}
              onAddClick={onAddClick}
              selectedDate={selectedDate}
              timeByDate={timeByDate}
              setTimeByDate={setTimeByDate}
              setOrdersByDate={setOrdersByDate}
              setModalRoom={setModalRoom}
              setModalData={setModalData}
              ordersByDate={ordersByDate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
