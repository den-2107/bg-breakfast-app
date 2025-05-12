import React, { useState, useEffect } from "react";

const DEFAULT_MENU = {
  dish1: [
    "Рисовая каша с черникой на кокосовом молоке",
    "Овсяная каша с ванилью на молоке",
    "Пшенная каша с тыквой",
    "Омлет с сыром",
    "Омлет с беконом",
    "Йогурт с гранолой"
  ],
  dish2: [
    "Сырники с джемом",
    "Блины классические",
    "Блины с мясом",
    "Блины с творогом",
    "Чиабатта с курицей",
    "Панини с говядиной",
    "Шоколадный маффин",
    "Апельсиновый маффин",
    "Злаковый батончик (To Go)"
  ],
  drinks: [
    "Американо",
    "Капучино",
    "Чай чёрный",
    "Чай зеленый",
    "Сок апельсиновый",
    "Сок яблочный",
    "Вода без газа",
    "Молоко"
  ],
  extras: [
    "Сметана",
    "Джем",
    "Мёд",
    "Тост",
    "Сливочное масло",
    "Сливки"
  ]
};

export default function MenuEditor({ onClose }) {
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem("menu");
    try {
      return saved ? JSON.parse(saved) : DEFAULT_MENU;
    } catch {
      return DEFAULT_MENU;
    }
  });

  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("dish1");
  const [confirm, setConfirm] = useState({ cat: null, index: null });

  useEffect(() => {
    localStorage.setItem("menu", JSON.stringify(menu));
  }, [menu]);

  const handleRemove = (category, index) => {
    setConfirm({ cat: category, index });
  };

  const confirmDelete = () => {
    const { cat, index } = confirm;
    if (cat !== null && index !== null) {
      setMenu(prev => ({
        ...prev,
        [cat]: prev[cat].filter((_, i) => i !== index)
      }));
    }
    setConfirm({ cat: null, index: null });
  };

  const cancelDelete = () => {
    setConfirm({ cat: null, index: null });
  };

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setMenu(prev => ({
      ...prev,
      [newCategory]: [...prev[newCategory], trimmed]
    }));
    setNewItem("");
  };

  const getCategoryLabel = (key) => {
    switch (key) {
      case "dish1": return "Первое блюдо";
      case "dish2": return "Второе блюдо";
      case "drinks": return "Напитки";
      case "extras": return "Допы";
      default: return key;
    }
  };

  const renderCategory = (key) => (
    <div key={key} style={{ flex: "1 1 45%" }}>
      <strong>{getCategoryLabel(key)}</strong>
      <ul style={{ paddingLeft: 0, margin: "8px 0", listStyle: "none" }}>
        {menu[key].map((item, i) => (
          <li key={i} style={{
            marginBottom: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>
              <span style={{ marginRight: 6 }}>•</span>{item}
            </span>
            <button onClick={() => handleRemove(key, i)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        width: "90%",
        maxWidth: "1000px",
        maxHeight: "90vh",
        backgroundColor: "#fff",
        padding: "24px 32px",
        borderRadius: "12px",
        overflowY: "auto",
        boxShadow: "0 6px 24px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ marginBottom: "16px" }}>Редактирование меню</h2>

        {/* Верхние категории */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", marginBottom: "24px" }}>
          {["dish1", "dish2"].map(renderCategory)}
        </div>

        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #ddd" }} />

        {/* Нижние категории */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", marginBottom: "16px" }}>
          {["drinks", "extras"].map(renderCategory)}
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Добавить позицию</h3>
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
            <option value="dish1">Первое блюдо</option>
            <option value="dish2">Второе блюдо</option>
            <option value="drinks">Напиток</option>
            <option value="extras">Допы</option>
          </select>
          <input
            type="text"
            placeholder="Название блюда"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            style={{ marginLeft: 10 }}
          />
          <button onClick={handleAdd} style={{ marginLeft: 10 }}>Сохранить</button>
        </div>

        <button onClick={onClose} style={{ marginTop: 24 }}>Закрыть</button>
      </div>

      {/* Модалка подтверждения удаления */}
      {confirm.cat !== null && confirm.index !== null && (
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
            <p style={{ marginBottom: "16px" }}>Удалить выбранный элемент?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button onClick={confirmDelete}>Да</button>
              <button onClick={cancelDelete}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
