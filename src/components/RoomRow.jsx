import React, { useState } from "react";
import OrderCard from "./OrderCard";

const TIME_SLOTS = [
  "Не выбрано",
  "07:30 - 08:00",
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "To Go"
];

export default function RoomRow({
  room,
  orders,
  onAddClick,
  selectedDate,
  timeByDate,
  setTimeByDate,
  setOrdersByDate,
  setModalRoom,
  setModalData
}) {
  const [confirmIndex, setConfirmIndex] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const dateKey = selectedDate.toLocaleDateString("sv-SE");
  const currentTime = timeByDate[dateKey]?.[room] || "Не выбрано";
  const hasOrders = (orders || []).length > 0;
  const maxReached = orders.length >= 5;

  const checkSlotLimit = (newTime) => {
    const timesForDate = timeByDate[dateKey] || {};
    const roomsInSlot = Object.values(timesForDate).filter((t) => t === newTime).length;
    return roomsInSlot >= 7;
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;

    if (checkSlotLimit(newTime)) {
      setShowWarning(true);
    }

    setTimeByDate((prev) => {
      const updated = { ...prev };
      if (!updated[dateKey]) updated[dateKey] = {};
      updated[dateKey][room] = newTime;
      return updated;
    });

    setOrdersByDate((prev) => {
      const updated = { ...prev };
      const currentOrders = updated[dateKey]?.[room] || [];
      const withToGo = currentOrders.map((o) => ({
        ...o,
        toGo: newTime === "To Go"
      }));
      if (!updated[dateKey]) updated[dateKey] = {};
      updated[dateKey][room] = withToGo;
      return updated;
    });
  };

  const confirmDeleteOrder = (index) => {
    setOrdersByDate((prev) => {
      const updated = { ...prev };
      const currentOrders = [...(updated[dateKey]?.[room] || [])];
      currentOrders.splice(index, 1);

      if (currentOrders.length === 0) {
        delete updated[dateKey][room];
        setTimeByDate((prevTime) => {
          const timeCopy = { ...prevTime };
          if (timeCopy[dateKey]) delete timeCopy[dateKey][room];
          return timeCopy;
        });
      } else {
        updated[dateKey][room] = currentOrders;
      }
      return updated;
    });
    setConfirmIndex(null);
  };

  const handleEditOrder = (index) => {
    const orderToEdit = orders[index];
    setModalRoom(room);
    setModalData({ ...orderToEdit, index });
  };

  const handleAddClick = () => {
    setModalRoom(room);
    setModalData({});
  };

  return (
    <>
      <tr>
        <td style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
          <strong>{room}</strong>
        </td>
        <td style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
          <select value={currentTime} onChange={handleTimeChange} disabled={!hasOrders}>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </td>
        <td style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(orders || []).map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <OrderCard order={o} index={i} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 }}>
                  <button onClick={() => handleEditOrder(i)} title="Редактировать заказ" style={{ cursor: "pointer" }}>✏️</button>
                  <button onClick={() => setConfirmIndex(i)} title="Удалить заказ" style={{ cursor: "pointer" }}>🗑️</button>
                </div>
                {confirmIndex === i && (
                  <div style={{ marginLeft: 10, background: "#fee", padding: 5, borderRadius: 4 }}>
                    <div>Удалить заказ?</div>
                    <button onClick={() => confirmDeleteOrder(i)} style={{ marginRight: 5 }}>Удалить</button>
                    <button onClick={() => setConfirmIndex(null)}>Отмена</button>
                  </div>
                )}
              </div>
            ))}
            <button
              style={{ marginTop: "5px", width: 32, height: 32 }}
              onClick={handleAddClick}
              disabled={maxReached}
              title={maxReached ? "Максимум 5 заказов" : "Добавить заказ"}
            >
              +
            </button>
          </div>
        </td>
      </tr>

      {showWarning && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.3)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff", padding: 20, borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: 300,
            textAlign: "center"
          }}>
            <p style={{ marginBottom: 20 }}>
              На выбранный слот уже назначено более 7 номеров.
            </p>
            <button onClick={() => setShowWarning(false)}>Ок</button>
          </div>
        </div>
      )}
    </>
  );
}
