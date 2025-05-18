import React from "react";

export default function OrderCard({ order, index }) {
  const isUrgent = order.urgent;
  const status = order.status || "pending";

  const getStatusStyle = (status) => {
    switch (status) {
      case "done": return { backgroundColor: "#52c41a", color: "white" };
      case "cancelled": return { backgroundColor: "#bfbfbf", color: "white" };
      default: return { backgroundColor: "#fadb14", color: "#000" };
    }
  };

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      background: isUrgent ? "#ffe6e6" : "#ffffff",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
      fontSize: "14px",
      lineHeight: "1.6",
      minWidth: 260,
      maxWidth: 260,
      minHeight: 240,
      maxHeight: 240,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflow: "hidden",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        fontSize: "12px",
        padding: "2px 6px",
        borderRadius: "4px",
        fontWeight: "bold",
        ...getStatusStyle(status)
      }}>
        {status === "done" ? "Доставлен" : status === "cancelled" ? "Отказ" : "Ожидается"}
      </div>

      <div>
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>Гость {index + 1}</div>

        {isUrgent && (
          <div style={{ color: "red", fontWeight: "bold", marginBottom: 6 }}>Срочно</div>
        )}

        <div><strong>Блюдо 1:</strong> {order.dish1 || <span style={{ color: '#bbb' }}>не выбрано</span>}</div>
        <div><strong>Блюдо 2:</strong> {order.dish2 || <span style={{ color: '#bbb' }}>не выбрано</span>}</div>
        <div><strong>Напиток:</strong> {order.drinks || <span style={{ color: '#bbb' }}>не выбрано</span>}</div>

        <div style={{ marginBottom: "2px" }}>
          <strong>Допы:</strong>{" "}
          {order.extras?.length > 0
            ? order.extras.join(", ")
            : <span style={{ color: '#bbb' }}>не выбрано</span>}
        </div>
      </div>

      <div style={{ marginTop: 4, overflowY: "auto", maxHeight: 80 }}>
        <strong>Комментарий:</strong><br />
        <span style={{
          fontStyle: "italic",
          color: order.comment ? "#444" : "#bbb",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word"
        }}>
          {order.comment || "введите комментарий"}
        </span>
      </div>
    </div>
  );
}
