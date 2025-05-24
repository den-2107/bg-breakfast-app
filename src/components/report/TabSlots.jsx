import React from "react";

export default function TabSlots({ slotStats }) {
  if (!slotStats) {
    return <p>📌 Нажмите «Составить отчёт», чтобы увидеть статистику по слотам</p>;
  }

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #ccc" }}>Слот</th>
          <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #ccc" }}>Кол-во заказов</th>
        </tr>
      </thead>
      <tbody>
        {slotStats.map(([slot, count], index) => (
          <tr key={index}>
            <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{slot}</td>
            <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
