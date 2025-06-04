import pb from "../pocketbase";

// ✅ Сохраняем новый заказ в PocketBase
export async function saveOrder(order) {
  const prepared = normalizeOrder(order);

  // 👉 добавляем created вручную
  prepared.created = new Date().toISOString();

  console.log("📦 saveOrder →", prepared);

  const record = await pb.collection("orders").create(prepared);
  return record;
}

// ✅ Обновляем заказ по ID
export async function updateOrder(id, order) {
  const prepared = normalizeOrder(order);
  console.log("✏️ updateOrder →", id, prepared);

  const record = await pb.collection("orders").update(id, prepared);
  return record;
}

// ✅ Удаляем заказ по ID
export async function deleteOrder(id) {
  return await pb.collection("orders").delete(id);
}

// ✅ Загружаем все заказы на конкретную дату (формат: "YYYY-MM-DD")
export async function loadOrdersByDate(dateStr) {
  const from = `${dateStr} 00:00:00`;
  const to = `${dateStr} 23:59:59`;

  const result = await pb.collection("orders").getFullList({
    filter: `date >= "${from}" && date <= "${to}"`,
    sort: "room,time",
    requestKey: null // ❗ не кэшировать результат
  });

  const grouped = {};
  for (const order of result) {
    const room = order.room;
    if (!grouped[room]) grouped[room] = [];

    // ✅ Прокидываем created → createdAt, чтобы использовать в Kitchen
    grouped[room].push({
      ...order,
      createdAt: order.created
    });
  }

  return grouped;
}

// ✅ Приводим заказ к нужному формату перед сохранением
function normalizeOrder(order) {
  const extract = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.name || val.id || "";
    return "";
  };

  const currentDate = new Date().toISOString().slice(0, 10);
  const time = order.time || "Не выбрано";
  const isToGo = time === "To Go";

  return {
    room: order.room || "",
    date: order.date || currentDate,
    time,
    dish1: extract(order.dish1),
    dish2: extract(order.dish2),
    drinks: extract(order.drinks),
    extras: (order.extras || []).map(extract),
    comment: order.comment || "",
    urgent: !!order.urgent,
    toGo: isToGo,
    status: order.status || "pending",
    deliveredAt: order.deliveredAt || null
  };
}
