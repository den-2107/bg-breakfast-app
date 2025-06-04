import React, { useState } from "react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import "dayjs/locale/ru";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import DateRangeFilter from "./DateRangeFilter";
import TabSummary from "./TabSummary";
import TabDishes from "./TabDishes";
import TabSlots from "./TabSlots";
import TabTiming from "./TabTiming";
import { loadOrdersInRange } from "./ReportsService";

dayjs.locale("ru");

export default function Reports() {
  const [activeTab, setActiveTab] = useState("summary");
  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs());
  const [reportData, setReportData] = useState(null);
  const [dishesStats, setDishesStats] = useState(null);
  const [slotStats, setSlotStats] = useState(null);
  const [timingStats, setTimingStats] = useState(null);
  const [timingStartDate, setTimingStartDate] = useState(null);
  const [timingEndDate, setTimingEndDate] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState(null);
  const [timeByDate, setTimeByDate] = useState(null);

  const generateReport = async () => {
    const from = startDate.format("YYYY-MM-DD");
    const to = endDate.format("YYYY-MM-DD");

    const result = await loadOrdersInRange(from, to);
    const localOrdersByDate = result.ordersByDate;
    const localTimeByDate = result.timeByDate;

    setOrdersByDate(localOrdersByDate);
    setTimeByDate(localTimeByDate);

    if (!localOrdersByDate || Object.keys(localOrdersByDate).length === 0) {
      setReportData(null);
      setDishesStats(null);
      setSlotStats(null);
      setTimingStats(null);
      setTimingStartDate(null);
      setTimingEndDate(null);
      return;
    }

    let totalOrders = 0;
    const roomsSet = new Set();
    let toGoCount = 0;
    const dishMap = {};
    const slotMap = {};
    const slotTimingMap = {};

    for (const dateKey in localOrdersByDate) {
      const currentDate = dayjs(dateKey, "YYYY-MM-DD");
      if (!currentDate.isValid() || currentDate.isBefore(startDate) || currentDate.isAfter(endDate)) continue;

      const rooms = localOrdersByDate[dateKey];
      for (const room in rooms) {
        const roomOrders = rooms[room];
        if (!Array.isArray(roomOrders)) continue;

        if (roomOrders.length > 0) roomsSet.add(room);

        const rawSlot = roomOrders[0]?.time || "Не выбрано";
        const slot = rawSlot || "Не выбрано";

        for (const order of roomOrders) {
          totalOrders++;
          if (order.toGo) toGoCount++;

          const allDishes = [order.dish1, order.dish2, order.drinks, ...(order.extras || [])];
          for (const item of allDishes) {
            const trimmed = item?.trim();
            if (trimmed) dishMap[trimmed] = (dishMap[trimmed] || 0) + 1;
          }

          slotMap[slot] = (slotMap[slot] || 0) + 1;

          if (!slotTimingMap[slot]) {
            slotTimingMap[slot] = { total: 0, onTime: 0, late: 0 };
          }

          slotTimingMap[slot].total++;

          if (order.deliveredAt) {
            const delivered = dayjs(order.deliveredAt);
            const endTimePart = slot.split("–")[1] || "09:30";
            const expected = dayjs(`${dateKey}T${endTimePart}`);
            if (delivered.isBefore(expected)) {
              slotTimingMap[slot].onTime++;
            } else {
              slotTimingMap[slot].late++;
            }
          }
        }
      }
    }

    if (activeTab === "summary" || activeTab === "dishes" || activeTab === "slots") {
      if (activeTab === "summary") {
        setReportData({ totalOrders, uniqueRooms: roomsSet.size, toGoCount });
      }
      if (activeTab === "summary" || activeTab === "dishes") {
        setDishesStats(Object.entries(dishMap).sort((a, b) => b[1] - a[1]));
      }
      if (activeTab === "summary" || activeTab === "slots") {
        setSlotStats(Object.entries(slotMap).sort((a, b) => b[1] - a[1]));
      }
    }

    if (activeTab === "summary" || activeTab === "timing") {
      setTimingStartDate(startDate);
      setTimingEndDate(endDate);
      setTimingStats(Object.entries(slotTimingMap).sort((a, b) => b[1].total - a[1].total));
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const addSheet = (data, sheetName) => {
      if (!data || data.length === 0) return;
      const sheet = XLSX.utils.json_to_sheet(data);
      const cols = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, ...data.map(row => (row[key] + "").length)) + 2
      }));
      sheet["!cols"] = cols;
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    };

    const addAOASheet = (aoa, sheetName) => {
      if (!aoa || aoa.length === 0) return;
      const sheet = XLSX.utils.aoa_to_sheet(aoa);
      sheet["!cols"] = aoa[0].map((_, i) => ({
        wch: Math.max(...aoa.map(row => ((row[i] + "")?.length || 0))) + 2
      }));
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    };

    if (activeTab === "summary") {
      if (!reportData || !dishesStats || !slotStats || !timingStats) {
        alert("Сначала нажмите «Составить отчёт», чтобы собрать все данные.");
        return;
      }

      addSheet([
        { Показатель: "Всего заказов", Значение: reportData.totalOrders },
        { Показатель: "Количество номеров", Значение: reportData.uniqueRooms },
        { Показатель: "To Go", Значение: reportData.toGoCount }
      ], "Общая статистика");

      addSheet(dishesStats.map(([name, count]) => ({ Позиция: name, Количество: count })), "По блюдам");
      addSheet(slotStats.map(([slot, count]) => ({ Слот: slot, "Кол-во заказов": count })), "По слотам");
      addSheet(timingStats.map(([slot, obj]) => ({
        Слот: slot,
        Всего: obj.total,
        Вовремя: obj.onTime,
        "С опозданием": obj.late
      })), "Скорость отдачи");

      const fullData = [];
      fullData.push(["Общая статистика"]);
      fullData.push(["Показатель", "Значение"]);
      fullData.push(["Всего заказов", reportData.totalOrders]);
      fullData.push(["Количество номеров", reportData.uniqueRooms]);
      fullData.push(["To Go", reportData.toGoCount]);

      fullData.push([]);
      fullData.push(["Популярные блюда и напитки"]);
      fullData.push(["Позиция", "Количество"]);
      dishesStats.forEach(([name, count]) => fullData.push([name, count]));

      fullData.push([]);
      fullData.push(["Нагрузка по слотам"]);
      fullData.push(["Слот", "Кол-во заказов"]);
      slotStats.forEach(([slot, count]) => fullData.push([slot, count]));

      fullData.push([]);
      fullData.push(["Скорость отдачи"]);
      fullData.push(["Слот", "Всего", "Вовремя", "С опозданием"]);
      timingStats.forEach(([slot, obj]) =>
        fullData.push([slot, obj.total, obj.onTime, obj.late])
      );

      addAOASheet(fullData, "Полный отчёт");
      XLSX.writeFile(workbook, `Отчёт_полный.xlsx`);
    } else {
      let data = [];
      let sheetName = "";

      if (activeTab === "dishes" && dishesStats) {
        data = dishesStats.map(([name, count]) => ({ Позиция: name, Количество: count }));
        sheetName = "По блюдам";
      } else if (activeTab === "slots" && slotStats) {
        data = slotStats.map(([slot, count]) => ({ Слот: slot, "Кол-во заказов": count }));
        sheetName = "По слотам";
      } else if (activeTab === "timing" && timingStats) {
        data = timingStats.map(([slot, obj]) => ({
          Слот: slot,
          Всего: obj.total,
          Вовремя: obj.onTime,
          "С опозданием": obj.late
        }));
        sheetName = "Скорость отдачи";
      } else {
        alert("Нет данных для экспорта.");
        return;
      }

      addSheet(data, sheetName);
      XLSX.writeFile(workbook, `${sheetName}_отчёт.xlsx`);
    }
  };

  const tabs = [
    { key: "summary", label: "Общий" },
    { key: "dishes", label: "По блюдам" },
    { key: "slots", label: "По слотам" },
    { key: "timing", label: "Скорость отдачи" }
  ];

  const buttonStyle = {
    padding: "6px 12px",
    fontSize: "14px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500"
  };

  const activeButton = {
    ...buttonStyle,
    backgroundColor: "#eee",
    cursor: "default",
    color: "#666"
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <div>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          onGenerate={generateReport}
          onExport={exportToExcel}
        />

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key ? activeButton : buttonStyle}
              disabled={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "10px 0" }}>
          {activeTab === "summary" && (
            <>
              <h3>Общая статистика</h3>
              <TabSummary reportData={reportData} />
              <hr style={{ margin: "24px 0" }} />
              <h3>Блюда и напитки</h3>
              <TabDishes dishesStats={dishesStats} />
              <hr style={{ margin: "24px 0" }} />
              <h3>Нагрузка по слотам</h3>
              <TabSlots slotStats={slotStats} />
              <hr style={{ margin: "24px 0" }} />
              <h3>Скорость отдачи</h3>
              <TabTiming
                startDate={timingStartDate}
                endDate={timingEndDate}
                ordersByDate={ordersByDate}
                timeByDate={timeByDate}
                onStatsReady={stats => setTimingStats(stats)}
              />
            </>
          )}
          {activeTab === "dishes" && <TabDishes dishesStats={dishesStats} />}
          {activeTab === "slots" && <TabSlots slotStats={slotStats} />}
          {activeTab === "timing" && (
            <TabTiming
              startDate={timingStartDate}
              endDate={timingEndDate}
              ordersByDate={ordersByDate}
              timeByDate={timeByDate}
              onStatsReady={stats => setTimingStats(stats)}
            />
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
}
