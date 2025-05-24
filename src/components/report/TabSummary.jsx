import React from "react";

export default function TabSummary({ reportData }) {
  if (!reportData) {
    return <p>📌 Нажмите «Составить отчёт», чтобы увидеть данные</p>;
  }

  return (
    <ul>
      <li><strong>Количество заказов:</strong> {reportData.totalOrders}</li>
      <li><strong>Количество номеров:</strong> {reportData.uniqueRooms}</li>
      <li><strong>Завтраков To Go:</strong> {reportData.toGoCount}</li>
    </ul>
  );
}
