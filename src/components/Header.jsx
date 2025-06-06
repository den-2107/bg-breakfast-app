import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export default function Header({
  currentPage,
  onSwitchPage,
  selectedDate,
  setSelectedDate,
  onEditMenu
}) {
  const formattedDate = selectedDate.toLocaleDateString("ru-RU");
  const [timeNow, setTimeNow] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDate = () => {
    if (currentPage === "kitchen") {
      setSelectedDate(new Date());
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
    }
  };

  const handleSoftReload = () => {
    localStorage.setItem("selectedTab", currentPage);
    localStorage.setItem("selectedDate", selectedDate.toISOString());
    window.location.reload();
  };

  const buttonStyle = {
    fontSize: "14px",
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    cursor: "pointer",
    fontWeight: "500"
  };

  const inactiveStyle = {
    ...buttonStyle,
    backgroundColor: "#eee",
    color: "#999",
    cursor: "default"
  };

  const stickyStyle = {
    position: "sticky",
    top: 0,
    backgroundColor: "#f9f9f9",
    zIndex: 1000,
    padding: "12px 20px",
    borderBottom: "1px solid #ddd",
    marginBottom: "20px"
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...stickyStyle
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        {currentPage === "kitchen" ? (
          <div style={{ display: "flex", alignItems: "center", fontSize: "28px", fontWeight: "bold" }}>
            <span style={{ marginRight: "12px" }}>Кухня — {formattedDate}</span>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  setSelectedDate(newValue.toDate());
                }
              }}
              format="DD.MM.YYYY"
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: { ml: 1, backgroundColor: "#fff", borderRadius: 1 }
                }
              }}
              PopperProps={{
                sx: {
                  "& .MuiPickersLayout-root, & .MuiDayCalendar-weekDayLabel, & .MuiDayCalendar-day": {
                    fontSize: "16px"
                  }
                }
              }}
            />
            <button onClick={handleResetDate} style={{ ...buttonStyle, marginLeft: "12px" }}>
              Сегодня
            </button>
          </div>
        ) : currentPage === "reports" ? (
          <div style={{ display: "flex", alignItems: "center", fontSize: "28px", fontWeight: "bold" }}>
            Отчёты
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            <h1 style={{ margin: 0, marginRight: 12, fontSize: "28px", fontWeight: "bold" }}>
              Завтраки для Bilibin Garden
            </h1>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  setSelectedDate(newValue.toDate());
                }
              }}
              format="DD.MM.YYYY"
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: { backgroundColor: "#fff", borderRadius: 1 }
                }
              }}
              PopperProps={{
                sx: {
                  "& .MuiPickersLayout-root, & .MuiDayCalendar-weekDayLabel, & .MuiDayCalendar-day": {
                    fontSize: "16px"
                  }
                }
              }}
            />
            <button onClick={handleResetDate} style={{ ...buttonStyle, marginLeft: "12px" }}>
              Сегодня
            </button>
          </div>
        )}
      </LocalizationProvider>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "18px", fontWeight: "600" }}>{timeNow}</span>
        <button onClick={handleSoftReload} style={buttonStyle}>
          Обновить
        </button>
        <button
          onClick={() => onSwitchPage("breakfasts")}
          style={currentPage === "breakfasts" ? inactiveStyle : buttonStyle}
          disabled={currentPage === "breakfasts"}
        >
          Завтраки
        </button>
        <button
          onClick={() => onSwitchPage("kitchen")}
          style={currentPage === "kitchen" ? inactiveStyle : buttonStyle}
          disabled={currentPage === "kitchen"}
        >
          Кухня
        </button>
        <button
          onClick={() => onSwitchPage("reports")}
          style={currentPage === "reports" ? inactiveStyle : buttonStyle}
          disabled={currentPage === "reports"}
        >
          Отчёты
        </button>
        <button onClick={onEditMenu} style={buttonStyle}>
          Редактировать меню
        </button>
      </div>
    </div>
  );
}
