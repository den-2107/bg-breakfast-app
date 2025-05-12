// ===== BreakfastTable.jsx =====
import React from "react";
import RoomRow from "./RoomRow";

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

  return (
    <div>
      <div
        style={{
          marginBottom: "12px",
          fontWeight: "bold",
          fontSize: "18px",
          paddingLeft: "0px"
        }}
      >
        Завтраки: {roomsWithOrders.length} номеров / {totalOrders} заказов
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc", padding: "8px" }}>Комната</th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "8px" }}>Время</th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "8px" }}>Завтрак</th>
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
              ordersByDate={ordersByDate} // 👈 добавлено сюда
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
