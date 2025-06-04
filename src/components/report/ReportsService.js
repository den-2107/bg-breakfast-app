import pb from "../../pocketbase";

// Загружаем заказы за выбранный период (в формате "YYYY-MM-DD")
export async function loadOrdersInRange(fromDate, toDate) {
  const from = `${fromDate} 00:00:00`;
  const to = `${toDate} 23:59:59`;

  const result = await pb.collection("orders").getFullList({
    filter: `date >= "${from}" && date <= "${to}"`,
    sort: "date,room,time",
    requestKey: null // отключаем кэширование
  });

  const ordersByDate = {};
  const timeByDate = {};

  for (const order of result) {
    const dateKey = order.date?.slice(0, 10);
    const room = order.room;

    // Заказы по дате и комнате
    if (!ordersByDate[dateKey]) ordersByDate[dateKey] = {};
    if (!ordersByDate[dateKey][room]) ordersByDate[dateKey][room] = [];
    ordersByDate[dateKey][room].push({
      ...order,
      createdAt: order.created // для TabTiming
    });

    // Слоты по дате и комнате (нужны для отчёта по скорости отдачи)
    if (!timeByDate[dateKey]) timeByDate[dateKey] = {};
    timeByDate[dateKey][room] = order.time || "Не выбрано";
  }

  return { ordersByDate, timeByDate };
}
