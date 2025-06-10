import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { updateOrder } from "./OrdersService";

export default function KitchenCard({ room, orders, isPriority, selectedDate, setOrdersByDate }) {
  const dateKey = selectedDate.toLocaleDateString("sv-SE");
  const roomName = room.replace(/\s*\(.*?\)/, "");

  const today = dayjs().format("YYYY-MM-DD");

  const initialStatus = orders[0]?.status || "pending";
  const initialDeliveredAt = orders[0]?.deliveredAt || null;

  const [status, setStatus] = useState(initialStatus);
  const [deliveredTime, setDeliveredTime] = useState(initialDeliveredAt);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const getStatusStyle = (status) => {
    switch (status) {
      case "done": return { backgroundColor: "#52c41a", color: "white" };
      case "cancelled": return { backgroundColor: "#bfbfbf", color: "white" };
      default: return { backgroundColor: "#fadb14", color: "#000" };
    }
  };

  const handleStatusSelect = async (newStatus) => {
    setStatus(newStatus);
    setMenuOpen(false);

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        const updated = {
          ...order,
          status: newStatus,
          deliveredAt: newStatus === "done" ? order.deliveredAt : null
        };
        try {
          await updateOrder(order.id, updated);
        } catch (err) {
          console.error("Ошибка при обновлении статуса:", err);
        }
        return updated;
      })
    );

    setOrdersByDate((prev) => {
      const newData = { ...prev };
      newData[dateKey][roomName] = updatedOrders;
      return newData;
    });

    if (newStatus !== "done") {
      setDeliveredTime(null);
    }
  };

  const handleDelivered = async () => {
    const now = new Date();
    const iso = now.toISOString();
    const formatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setStatus("done");
    setDeliveredTime(formatted);

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        const updated = {
          ...order,
          status: "done",
          deliveredAt: iso
        };
        try {
          await updateOrder(order.id, updated);
        } catch (err) {
          console.error("Ошибка при установке deliveredAt:", err);
        }
        return updated;
      })
    );

    setOrdersByDate((prev) => {
      const newData = { ...prev };
      newData[dateKey][roomName] = updatedOrders;
      return newData;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "12px 16px",
      marginBottom: "14px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "6px" }}>
        Номер {roomName} ({orders.length} чел.){isPriority ? " приоритет" : ""}
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontWeight: "bold", marginRight: 6 }}>Статус:</span>
        <div
          style={{
            ...getStatusStyle(status),
            padding: "2px 8px",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            position: "relative"
          }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {status === "done" ? "Доставлен" : status === "cancelled" ? "Отказ" : "Ожидается"}
        </div>
        {menuOpen && (
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              marginTop: "30px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "6px",
              zIndex: 1000
            }}
          >
            <div
              onClick={() => handleStatusSelect("pending")}
              style={{ padding: "8px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Ожидается
            </div>
            <div
              onClick={() => handleStatusSelect("cancelled")}
              style={{ padding: "8px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Отказ
            </div>
          </div>
        )}
      </div>

      {orders.map((order, index) => {
        const { dish1, dish2, drinks, extras, comment, createdAt } = order;

        const isSameDay = dayjs(createdAt).format("YYYY-MM-DD") === today &&
                          dayjs(selectedDate).format("YYYY-MM-DD") === today;

        const extrasList = typeof extras === "string"
          ? extras.split(/[,\\s]+/).filter(Boolean)
          : Array.isArray(extras) ? extras : [];

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <div style={{
                height: "1px",
                backgroundColor: "#333",
                margin: "14px 0"
              }} />
            )}

            <div
              style={{
                backgroundColor: isSameDay ? "#fffbe6" : "#f9f9f9",
                borderRadius: "6px",
                padding: "10px 12px",
                border: "1px solid #e0e0e0"
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>Завтрак {index + 1}</div>

              {dish1 && (<><div>{dish1}</div><div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} /></>)}
              {dish2 && (<><div>{dish2}</div><div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} /></>)}
              {drinks && (<><div>{drinks}</div><div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} /></>)}
              {extrasList.length > 0 && (<><div>{extrasList.join(", ")}</div><div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} /></>)}

              <div style={{
                marginTop: "6px",
                padding: "6px 10px",
                backgroundColor: "#f2f2f2",
                borderRadius: "6px",
                fontStyle: "italic",
                fontSize: "14px",
                color: comment ? "#444" : "#888",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap"
              }}>
                <strong>Комментарий:</strong> {comment || "—"}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      <div style={{ marginTop: "12px" }}>
        <button
          onClick={handleDelivered}
          disabled={status === "done"}
          style={{
            width: "100%",
            padding: "8px 0",
            backgroundColor: status === "done" ? "#52c41a" : "#fff",
            color: status === "done" ? "white" : "#000",
            border: "1px solid #aaa",
            borderRadius: "6px",
            cursor: status === "done" ? "not-allowed" : "pointer",
            fontWeight: "bold",
            opacity: status === "done" ? 0.6 : 1
          }}
        >
          {status === "done" ? "Доставлено" : "В доставку"}
        </button>

        {status === "done" && orders[0]?.deliveredAt && (
          <div style={{ marginTop: "6px", textAlign: "center", color: "#555", fontSize: "14px" }}>
            Доставлено в {dayjs(orders[0].deliveredAt).format("HH:mm")}
          </div>
        )}
      </div>
    </div>
  );
}
