import React from "react";
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

  const handleResetDate = () => {
    if (currentPage === "kitchen") {
      setSelectedDate(new Date()); // сегодня
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow); // завтра
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}
    >
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
      >
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
            <button
              onClick={handleResetDate}
              style={{
                marginLeft: "12px",
                fontSize: "14px",
                padding: "4px 10px",
                borderRadius: "4px",
                backgroundColor: "#fff",
                border: "1px solid #aaa",
                cursor: "pointer"
              }}
            >
              Сегодня
            </button>
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
            <button
              onClick={handleResetDate}
              style={{
                marginLeft: "12px",
                fontSize: "14px",
                padding: "4px 10px",
                borderRadius: "4px",
                backgroundColor: "#fff",
                border: "1px solid #aaa",
                cursor: "pointer"
              }}
            >
              Сегодня
            </button>
          </div>
        )}
      </LocalizationProvider>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => onSwitchPage("breakfasts")}>Завтраки</button>
        <button onClick={() => onSwitchPage("kitchen")}>Кухня</button>
        <button onClick={onEditMenu}>Редактировать меню</button>
      </div>
    </div>
  );
}
