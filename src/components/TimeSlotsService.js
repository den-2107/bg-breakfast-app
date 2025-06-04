import pb from "../pocketbase";

// ✅ Загружаем слоты в виде массива (для App.jsx → .forEach)
export async function loadTimeSlotsRaw(dateStr) {
  const result = await pb.collection("time_slots").getFullList({
    requestKey: null
  });

  return Array.isArray(result)
    ? result.filter(
        (slot) =>
          new Date(slot.date).toISOString().slice(0, 10) === dateStr
      )
    : [];
}

// ✅ Загружаем и группируем по комнатам
export async function loadTimeSlotsByDate(dateStr) {
  const result = await loadTimeSlotsRaw(dateStr);

  const grouped = {};
  for (const slot of result) {
    if (!grouped[slot.date]) grouped[slot.date] = {};
    grouped[slot.date][slot.room] = slot.time;
  }

  return grouped[dateStr] || {};
}

// ✅ Сохраняем или обновляем слот времени с логами
export async function saveTimeSlot(date, room, time) {
  const prepared = { date, room, time };

  try {
    const slots = await pb.collection("time_slots").getFullList({
      requestKey: null
    });

    const norm = (str) => (str || "").trim().toLowerCase();
    const normalizedRoom = norm(room);
    const normalizedDate = new Date(date).toISOString().slice(0, 10);

    console.log("🔍 saveTimeSlot()");
    console.log("→ Дата:", date);
    console.log("→ Комната:", `"${room}"`);
    console.log("→ Время:", time);
    console.log("→ Загружено слотов:", slots.length);

    const existing = slots.find((slot) => {
      const slotDate = new Date(slot.date).toISOString().slice(0, 10);
      const match =
        slotDate === normalizedDate && norm(slot.room) === normalizedRoom;
      console.log(
        `   🧪 Сравниваем: "${slot.room}"@${slotDate} ? "${room}"@${normalizedDate} → ${match}`
      );
      return match;
    });

    if (existing) {
      if (existing.time === time) {
        console.log("⏭️ Уже записано такое же время — ничего не делаем");
        return existing;
      }

      console.log(
        `✏️ Обновляем слот ID ${existing.id} (${existing.room}) → ${time}`
      );
      return await pb.collection("time_slots").update(existing.id, prepared);
    }

    console.log(`➕ Создаём новый слот: ${room} → ${time}`);
    return await pb.collection("time_slots").create(prepared);
  } catch (error) {
    console.error("❌ Ошибка при сохранении слота:", error);
    throw error;
  }
}

// ✅ Удаляем слот времени, если он больше не нужен
export async function deleteTimeSlot(date, room) {
  try {
    const slots = await pb.collection("time_slots").getFullList({
      requestKey: null
    });

    const norm = (str) => (str || "").trim().toLowerCase();
    const normalizedRoom = norm(room);
    const normalizedDate = new Date(date).toISOString().slice(0, 10);

    const existing = slots.find((slot) => {
      const slotDate = new Date(slot.date).toISOString().slice(0, 10);
      return (
        slotDate === normalizedDate &&
        norm(slot.room) === normalizedRoom
      );
    });

    if (existing) {
      console.log(`🗑️ Удаляем слот ID ${existing.id} для комнаты ${room}`);
      return await pb.collection("time_slots").delete(existing.id);
    } else {
      console.log("⚠️ Нечего удалять — слот не найден");
    }
  } catch (error) {
    console.warn("⚠️ Ошибка при удалении слота:", error);
  }
}
