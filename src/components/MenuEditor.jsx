// ===== MenuEditor.jsx =====
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

  return (
    <div>
      <h2>Редактирование меню</h2>

      {Object.entries(menu).map(([key, items]) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <strong style={{ textTransform: "capitalize" }}>
            {key === "dish1" ? "Первое блюдо" :
             key === "dish2" ? "Второе блюдо" :
             key === "drinks" ? "Напитки" :
             key === "extras" ? "Допы" : key}
          </strong>
          <ul>
            {items.map((item, i) => (
              <li key={i}>
                {item} {" "}
                <button onClick={() => handleRemove(key, i)}>Удалить</button>
                {confirm.cat === key && confirm.index === i && (
                  <span style={{ marginLeft: 10, background: "#fee", padding: "2px 6px", borderRadius: 4 }}>
                    Удалить? <button onClick={confirmDelete}>Да</button> <button onClick={cancelDelete}>Нет</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        <h3>Добавить позицию</h3>
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

      <button onClick={onClose} style={{ marginTop: 20 }}>Закрыть</button>
    </div>
  );
}
