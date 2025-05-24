import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function MenuEditor({ onClose }) {
  const [menu, setMenu] = useState({
    dish1: [],
    dish2: [],
    drinks: [],
    extras: [],
  });

  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("dish1");
  const [confirm, setConfirm] = useState({ cat: null, id: null });

  // Загрузка меню из Supabase
  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase
        .from("menu")
        .select("id, name, type, group, available")
        .eq("available", true);

      if (error) {
        console.error("❌ Ошибка загрузки:", error.message);
        return;
      }

      const grouped = {
        dish1: [],
        dish2: [],
        drinks: [],
        extras: [],
      };

      data.forEach((item) => {
        if (item.type === "dish") {
          if (item.group === "dish1") grouped.dish1.push(item);
          else if (item.group === "dish2") grouped.dish2.push(item);
        } else if (item.type === "drink") {
          grouped.drinks.push(item);
        } else if (item.type === "extra") {
          grouped.extras.push(item);
        }
      });

      setMenu(grouped);
    }

    fetchMenu();
  }, []);

  // Добавление
  const handleAdd = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    let type, group = null;
    if (newCategory === "dish1" || newCategory === "dish2") {
      type = "dish";
      group = newCategory;
    } else if (newCategory === "drinks") {
      type = "drink";
    } else if (newCategory === "extras") {
      type = "extra";
    }

    const { data, error } = await supabase
      .from("menu")
      .insert([{ name: trimmed, type, group, available: true }])
      .select();

    if (error) {
      console.error("❌ Ошибка добавления:", error.message);
      return;
    }

    setMenu((prev) => ({
      ...prev,
      [newCategory]: [...prev[newCategory], data[0]],
    }));

    setNewItem("");
  };

  // Удаление
  const confirmDelete = async () => {
    const { cat, id } = confirm;
    if (!id || !cat) return;

    const { error } = await supabase.from("menu").delete().eq("id", id);

    if (error) {
      console.error("❌ Ошибка удаления:", error.message);
      return;
    }

    setMenu((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((item) => item.id !== id),
    }));

    setConfirm({ cat: null, id: null });
  };

  const cancelDelete = () => setConfirm({ cat: null, id: null });
  const handleRemove = (category, id) => setConfirm({ cat: category, id });

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
        {menu[key].map((item) => (
          <li key={item.id} style={{
            marginBottom: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px"
          }}>
            <span><span style={{ marginRight: 6 }}>•</span>{item.name}</span>
            <button onClick={() => handleRemove(key, item.id)}>Удалить</button>
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

        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", marginBottom: "24px" }}>
          {["dish1", "dish2"].map(renderCategory)}
        </div>

        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #ddd" }} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", marginBottom: "16px" }}>
          {["drinks", "extras"].map(renderCategory)}
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Добавить позицию</h3>
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="dish1">Первое блюдо</option>
            <option value="dish2">Второе блюдо</option>
            <option value="drinks">Напиток</option>
            <option value="extras">Допы</option>
          </select>
          <input
            type="text"
            placeholder="Название блюда"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            style={{ marginLeft: 10 }}
          />
          <button onClick={handleAdd} style={{ marginLeft: 10 }}>Сохранить</button>
        </div>

        <button onClick={onClose} style={{ marginTop: 24 }}>Закрыть</button>
      </div>

      {confirm.cat && confirm.id && (
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
