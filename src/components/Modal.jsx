import React, { useState, useEffect } from "react";
import DishSelector from "./DishSelector";

export default function Modal({ room, data, setData, onClose, onSave, selectedDate, timeByDate, ordersByDate }) {
  const [selectingDish, setSelectingDish] = useState(null);

  // ✅ Автоматически ставим срочность, если в комнате уже есть срочный заказ
  useEffect(() => {
    if (!("urgent" in data)) {
      const dateKey = selectedDate.toLocaleDateString("sv-SE");
      const roomOrders = ordersByDate?.[dateKey]?.[room] || [];
      const hasUrgent = roomOrders.some((o) => o?.urgent);
      if (hasUrgent) {
        setData((prev) => ({ ...prev, urgent: true }));
      }
    }
  }, []);

  // ✅ При первом открытии — подставляем time и toGo, если это новый заказ
  useEffect(() => {
    if (!("time" in data)) {
      const dateKey = selectedDate.toLocaleDateString("sv-SE");
      const currentTime = timeByDate?.[dateKey]?.[room] || "Не выбрано";
      const isToGo = currentTime === "To Go";

      setData((prev) => ({
        ...prev,
        time: currentTime,
        toGo: isToGo
      }));
    }
  }, []);

  const handleDishSelect = (type, value) => {
    setData(prev => ({ ...prev, [type]: value }));
    setSelectingDish(null);
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const dateKey = selectedDate.toLocaleDateString("sv-SE");
    const currentTime = timeByDate?.[dateKey]?.[room] || "Не выбрано";
    const isToGo = currentTime === "To Go";

    onSave({
      ...data,
      room,
      date: dateKey,
      time: currentTime,
      toGo: isToGo
    });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
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
          <button onClick={handleSave}>Сохранить</button>
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
