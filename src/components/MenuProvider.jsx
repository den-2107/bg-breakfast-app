// components/MenuProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import pb from "../pocketbase";

// 🔧 Функция для загрузки меню (можно использовать отдельно)
export async function fetchMenu() {
  return await pb.collection("menu").getFullList({
    sort: "group,name"
  });
}

// Создаём контекст
const MenuContext = createContext();

export function useMenu() {
  return useContext(MenuContext);
}

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка меню из PocketBase при запуске
  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const records = await fetchMenu();
      setMenu(records);
    } catch (error) {
      console.error("🧨 Ошибка при загрузке меню:", error);
    } finally {
      setLoading(false);
    }
  }

  // Добавление новой позиции
  async function addDish(data) {
    try {
      const newDish = await pb.collection("menu").create(data);
      setMenu(prev => [...prev, newDish]);
      return newDish;
    } catch (error) {
      console.error("🧨 Ошибка при добавлении:", error);
      throw error;
    }
  }

  // Удаление позиции
  async function deleteDish(id) {
    try {
      await pb.collection("menu").delete(id);
      setMenu(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("🧨 Ошибка при удалении:", error);
      throw error;
    }
  }

  const value = {
    menu,
    loading,
    addDish,
    deleteDish,
    reloadMenu: loadMenu,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
