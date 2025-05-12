import React from "react";
import KitchenCard from "./KitchenCard";

export default function Kitchen({ selectedDate, ordersByDate, timeByDate, setOrdersByDate }) {
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

  const filteredRooms = Object.entries(orders).filter(([_, orderList]) =>
    Array.isArray(orderList) && orderList.some(order => order && Object.keys(order).length > 0)
  );

  for (const [room, orderList] of filteredRooms) {
    const filteredOrders = orderList.filter(order => !isToGo(order?.toGo));
    if (filteredOrders.length === 0) continue;

    const slot = times?.[room] || "Не выбрано";
    if (!ordersBySlot[slot]) ordersBySlot[slot] = [];
    ordersBySlot[slot].push([room, filteredOrders]);
  }

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {Object.entries(ordersBySlot).map(([slot, roomEntries]) => {
        const sortedRooms = [...roomEntries].sort(([roomA, ordersA], [roomB, ordersB]) => {
          const hasUrgentA = ordersA.some((o) => o.urgent);
          const hasUrgentB = ordersB.some((o) => o.urgent);

          if (hasUrgentA && !hasUrgentB) return -1;
          if (!hasUrgentA && hasUrgentB) return 1;

          return roomA.localeCompare(roomB, "ru", { numeric: true });
        });

        if (sortedRooms.length === 0) return null;

        return (
          <div key={slot} style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
              {slot}
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "flex-start"
              }}
            >
              {sortedRooms.map(([room, roomOrders]) => (
                <div key={room} style={{ width: "300px" }}>
                  <KitchenCard
                    room={room}
                    orders={roomOrders}
                    isPriority={roomOrders.some((o) => o.urgent)}
                    selectedDate={selectedDate}
                    setOrdersByDate={setOrdersByDate}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
