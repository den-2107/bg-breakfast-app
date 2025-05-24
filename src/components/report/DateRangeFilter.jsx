import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function DateRangeFilter({ startDate, endDate, setStartDate, setEndDate, onGenerate, onExport }) {
  const buttonStyle = {
    padding: "6px 12px",
    fontSize: "14px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500"
  };

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
      <label>С:</label>
      <DatePicker
        value={startDate}
        onChange={(newValue) => newValue && setStartDate(newValue)}
        format="DD.MM.YYYY"
        slotProps={{
          textField: {
            size: "small",
            variant: "outlined",
            sx: { backgroundColor: "#fff", borderRadius: 1, width: "130px" }
          }
        }}
      />
      <label>По:</label>
      <DatePicker
        value={endDate}
        onChange={(newValue) => newValue && setEndDate(newValue)}
        format="DD.MM.YYYY"
        slotProps={{
          textField: {
            size: "small",
            variant: "outlined",
            sx: { backgroundColor: "#fff", borderRadius: 1, width: "130px" }
          }
        }}
      />
      <button onClick={onGenerate} style={buttonStyle}>
        Составить отчёт
      </button>
      <button onClick={onExport} style={buttonStyle}>
        Экспорт в Excel
      </button>
    </div>
  );
}
