import React from "react";

export default function KitchenCard({ room, orders, isPriority, selectedDate, setOrdersByDate }) {
  const today = new Date().toDateString();

  const getStatusStyle = (status) => {
    switch (status) {
      case "done": return { backgroundColor: "#52c41a", color: "white" };
      case "cancelled": return { backgroundColor: "#bfbfbf", color: "white" };
      default: return { backgroundColor: "#fadb14", color: "#000" };
    }
  };

  const handleStatusChange = (index, newStatus) => {
    setOrdersByDate(prev => {
      const newData = { ...prev };
      const dateKey = selectedDate.toLocaleDateString("sv-SE");
      const roomOrders = newData[dateKey]?.[room];
      if (!roomOrders) return prev;
      roomOrders[index].status = newStatus;
      return { ...newData };
    });
  };

  const roomName = room.replace(/\s*\(.*?\)/, "");

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "12px 16px",
      marginBottom: "14px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "12px" }}>
        Номер {roomName} ({orders.length} чел.){isPriority ? " приоритет" : ""}
      </div>

      {orders.map((order, index) => {
        const { dish1, dish2, drinks, extras, comment, createdAt, status = "pending" } = order;
        const isSameDay =
          createdAt &&
          new Date(createdAt).toDateString() === today &&
          selectedDate.toDateString() === today;

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
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                alignItems: "center"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  gap: "6px"
                }}>
                  Завтрак {index + 1}
                </div>
                <div style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  ...getStatusStyle(status)
                }}>
                  {status === "done" ? "Доставлен" : status === "cancelled" ? "Отказ" : "Ожидается"}
                </div>
              </div>

              {dish1 && (
                <>
                  <div>{dish1}</div>
                  <div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} />
                </>
              )}
              {dish2 && (
                <>
                  <div>{dish2}</div>
                  <div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} />
                </>
              )}
              {drinks && (
                <>
                  <div>{drinks}</div>
                  <div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} />
                </>
              )}
              {extrasList.length > 0 && (
                <>
                  <div>{extrasList.join(", ")}</div>
                  <div style={{ borderBottom: "1px solid #ccc", margin: "6px 0" }} />
                </>
              )}

              {/* Комментарий - улучшенный стиль */}
              <div style={{
                marginTop: "6px",
                padding: "6px 10px",
                backgroundColor: "#f2f2f2",
                borderRadius: "6px",
                fontStyle: "italic",
                fontSize: "14px",
                color: comment ? "#444" : "#888"
              }}>
                <strong>Комментарий:</strong> {comment || "—"}
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: "8px" }}>
                <button onClick={() => handleStatusChange(index, "done")}>Доставлен</button>
                <button onClick={() => handleStatusChange(index, "cancelled")}>Отказ</button>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
