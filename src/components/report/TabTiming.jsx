import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const SLOT_TIMES = {
  "07:30 - 08:00": ["07:30", "08:00"],
  "08:00 - 08:30": ["08:00", "08:30"],
  "08:30 - 09:00": ["08:30", "09:00"],
  "09:00 - 09:30": ["09:00", "09:30"],
  "09:30 - 10:00": ["09:30", "10:00"],
  "10:00 - 10:30": ["10:00", "10:30"],
  "10:30 - 11:00": ["10:30", "11:00"]
};

export default function TabTiming({ startDate, endDate, ordersByDate, timeByDate, onStatsReady }) {
  const [timingStats, setTimingStats] = useState(null);
  const [lastSentJSON, setLastSentJSON] = useState("");

  useEffect(() => {
    if (!startDate || !endDate || !ordersByDate || !timeByDate) return;

    const stats = {};
    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day");

    for (const dateKey in ordersByDate) {
      const currentDate = dayjs(dateKey, "YYYY-MM-DD");
      if (!currentDate.isValid() || currentDate.isBefore(start) || currentDate.isAfter(end)) {
        continue;
      }

      const orders = ordersByDate[dateKey];
      const times = timeByDate[dateKey] || {};

      for (const room in orders) {
        const roomOrders = orders[room];
        const slotLabel = times[room] || roomOrders[0]?.time;
        const slotRange = SLOT_TIMES[slotLabel];

        if (!slotRange) continue;

        const [slotStart, slotEnd] = slotRange.map(t => dayjs(`${dateKey}T${t}`));

        for (const order of roomOrders) {
          if (!order.deliveredAt) continue;

          const delivered = dayjs(order.deliveredAt);
          if (!delivered.isValid()) continue;

          const inSlot = delivered.isSameOrAfter(slotStart) && delivered.isSameOrBefore(slotEnd);

          if (!stats[slotLabel]) {
            stats[slotLabel] = { total: 0, onTime: 0, late: 0 };
          }

          stats[slotLabel].total++;
          if (inSlot) stats[slotLabel].onTime++;
          else stats[slotLabel].late++;
        }
      }
    }

    const sorted = Object.entries(stats).sort(([, a], [, b]) => b.total - a.total);
    setTimingStats(sorted);

    const newJSON = JSON.stringify(sorted);
    if (onStatsReady && newJSON !== lastSentJSON) {
      onStatsReady(sorted);
      setLastSentJSON(newJSON);
    }
  }, [startDate, endDate, ordersByDate, timeByDate]);

  if (!startDate || !endDate) {
    return <p>📌 Нажмите «Составить отчёт», чтобы увидеть данные</p>;
  }

  if (!timingStats || timingStats.length === 0) {
    return <p>📌 Нет данных для отчёта или не нажимали «Доставлено»</p>;
  }

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={cellHead}>Слот</th>
          <th style={cellHead}>Всего</th>
          <th style={cellHead}>Вовремя</th>
          <th style={cellHead}>С опозданием</th>
        </tr>
      </thead>
      <tbody>
        {timingStats.map(([slot, data]) => (
          <tr key={slot}>
            <td style={cellBody}>{slot}</td>
            <td style={cellBody}>{data.total}</td>
            <td style={cellBody}>{data.onTime}</td>
            <td style={cellBody}>{data.late}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const cellHead = {
  textAlign: "left",
  padding: "6px",
  borderBottom: "1px solid #ccc"
};

const cellBody = {
  padding: "6px",
  borderBottom: "1px solid #eee"
};
