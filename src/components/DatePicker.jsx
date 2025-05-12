// ===== DatePicker.jsx =====
import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

export default function DatePicker({ selectedDate, setSelectedDate }) {
  return (
    <Flatpickr
      value={selectedDate}
      onChange={([date]) => setSelectedDate(new Date(date))}
      options={{
        locale: "ru",
        dateFormat: "d.m.Y"
      }}
      style={{
        fontSize: "18px",
        padding: "6px 10px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        marginTop: "4px"
      }}
    />
  );
}
