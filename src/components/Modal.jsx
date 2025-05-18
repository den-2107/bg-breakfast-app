import React, { useState, useEffect } from "react";
import DishSelector from "./DishSelector";

export default function Modal({ room, data, setData, onClose, onSave }) {
  const [selectingDish, setSelectingDish] = useState(null);

  // Если хотя бы один заказ в этой комнате срочный — автоматически включаем галочку "Срочно"
  useEffect(() => {
    if (!("urgent" in data)) {
      try {
        const saved = localStorage.getItem("ordersByDate");
        const all = saved ? JSON.parse(saved) : {};
        const todayKey = new Date().toLocaleDateString("sv-SE");
        const roomOrders = all?.[todayKey]?.[room] || [];
        const hasUrgent = roomOrders.some((o) => o?.urgent);
        if (hasUrgent) {
          setData((prev) => ({ ...prev, urgent: true }));
        }
      } catch (err) {
        console.error("Ошибка при чтении срочности:", err);
      }
    }
  }, []);

  const handleDishSelect = (type, value) => {
    setData(prev => ({ ...prev, [type]: value }));
    setSelectingDish(null);
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: 20,
        width: "400px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
      }}>
        <h2>Добавить заказ в комнату {room}</h2>

        <div style={{ marginBottom: 10 }}>
          <label>Блюдо 1:</label><br />
          <button onClick={() => setSelectingDish("dish1")}>
            {data.dish1 || "Выбрать"}
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Блюдо 2:</label><br />
          <button onClick={() => setSelectingDish("dish2")}>
            {data.dish2 || "Выбрать"}
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Напиток:</label><br />
          <button onClick={() => setSelectingDish("drinks")}>
            {data.drinks || "Выбрать"}
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Допы:</label><br />
          <button onClick={() => setSelectingDish("extras")}>
            {data.extras?.length ? data.extras.join(", ") : "Выбрать"}
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Комментарий:</label><br />
          <textarea
            value={data.comment || ""}
            onChange={(e) => handleChange("comment", e.target.value)}
            placeholder="Например: без лука, два сока, поздняя подача"
            style={{ width: "100%", minHeight: 60 }}
          />
        </div>

        {/* Галочка "Срочно" */}
        <div style={{ marginBottom: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={data.urgent || false}
              onChange={(e) => handleChange("urgent", e.target.checked)}
            />{" "}
            Срочно
          </label>
        </div>

        <div style={{ marginTop: 20 }}>
          <button onClick={onClose} style={{ marginRight: 10 }}>Отмена</button>
          <button onClick={onSave}>Сохранить</button>
        </div>

        {selectingDish && (
          <DishSelector
            type={selectingDish}
            selected={data[selectingDish]}
            onSelect={(value) => handleDishSelect(selectingDish, value)}
            onClose={() => setSelectingDish(null)}
          />
        )}
      </div>
    </div>
  );
}
