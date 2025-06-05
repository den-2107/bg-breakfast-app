import React, { useState } from "react";
import OrderCard from "./OrderCard";
import { deleteOrder, updateOrder } from "./OrdersService";
import { saveTimeSlot, deleteTimeSlot } from "./TimeSlotsService";

const TIME_SLOTS = [
  "Не выбрано",
  "07:30 - 08:00",
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
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
    if (newTime === "Не выбрано") return false;
    const timesForDate = timeByDate[dateKey] || {};
    const roomsInSlot = Object.values(timesForDate).filter((t) => t === newTime).length;
    return roomsInSlot >= 7;
  };

  const handleTimeChange = async (e) => {
    const newTime = e.target.value;
    const isToGo = newTime === "To Go";

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
      const withUpdatedTime = currentOrders.map((o) => ({
        ...o,
        time: newTime,
        toGo: isToGo
      }));
      if (!updated[dateKey]) updated[dateKey] = {};
      updated[dateKey][room] = withUpdatedTime;
      return updated;
    });

    try {
      await saveTimeSlot(dateKey, room, newTime);
    } catch (error) {
      console.error("Ошибка при сохранении временного слота:", error);
    }

    for (const order of orders) {
      if (order.id) {
        try {
          await updateOrder(order.id, {
            ...order,
            time: newTime,
            toGo: isToGo
          });
        } catch (error) {
          console.error("Ошибка при обновлении времени заказа:", error);
        }
      }
    }
  };

  const handleEditOrder = (index) => {
    const orderToEdit = orders[index];
    setModalRoom(room);
    setModalData(orderToEdit);
  };

  const handleDeleteOrder = async (index) => {
    const orderToDelete = orders[index];
    if (!orderToDelete?.id) return;

    try {
      await deleteOrder(orderToDelete.id);

      setOrdersByDate((prev) => {
        const updated = { ...prev };
        const currentOrders = (updated[dateKey]?.[room] || []).filter(o => o.id !== orderToDelete.id);

        if (currentOrders.length === 0) {
          delete updated[dateKey][room];

          deleteTimeSlot(dateKey, room);

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

    } catch (error) {
      console.error("Ошибка при удалении заказа:", error);
      alert("Не удалось удалить заказ");
    }

    setConfirmIndex(null);
  };

  const handleAddClick = () => {
    setModalRoom(room);
    setModalData({});
  };

  return (
    <>
      <tr>
        <td style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
          <strong style={{ fontSize: "18px" }}>{room}</strong>
        </td>

        <td style={{ borderBottom: "1px solid #ccc", padding: "8px", whiteSpace: "nowrap" }}>
          <select value={currentTime} onChange={handleTimeChange} disabled={!hasOrders}>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </td>

        <td style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "flex-start"
          }}>
            {(orders || []).map((o, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                position: "relative"
              }}>
                <div style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "flex-start"
                }}>
                  <OrderCard order={o} index={i} />
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 4
                  }}>
                    <button onClick={() => handleEditOrder(i)} title="Редактировать заказ" style={{ cursor: "pointer" }}>✏️</button>
                    <button onClick={() => setConfirmIndex(i)} title="Удалить заказ" style={{ cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
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

      {confirmIndex !== null && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "24px 32px",
            borderRadius: "12px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
            maxWidth: "300px",
            width: "100%",
            textAlign: "center"
          }}>
            <p style={{ marginBottom: "16px" }}>Удалить этот заказ?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button onClick={() => handleDeleteOrder(confirmIndex)}>Да</button>
              <button onClick={() => setConfirmIndex(null)}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
