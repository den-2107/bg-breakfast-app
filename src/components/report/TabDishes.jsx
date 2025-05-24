import React from "react";

export default function TabDishes({ dishesStats }) {
  if (!dishesStats) {
    return <p>📌 Нажмите «Составить отчёт», чтобы увидеть статистику</p>;
  }
  return (

    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #ccc" }}>Позиция</th>
          <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #ccc" }}>Кол-во</th>
        </tr>
      </thead>
      <tbody>
        {dishesStats.map(([name, count], index) => (
          <tr key={index}>
            <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{name}</td>
            <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
