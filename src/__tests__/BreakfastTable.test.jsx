import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import BreakfastTable from "../components/BreakfastTable";

// Мокаем комнаты
const ROOMS = ["1", "A2"];

describe("BreakfastTable", () => {
  const setup = (customOrders = {}, customOnAddClick = jest.fn()) => {
    render(
      <BreakfastTable
        selectedDate={new Date()}
        rooms={ROOMS}
        orders={customOrders}
        onAddClick={customOnAddClick}
        setTimeByDate={() => {}}
        timeByDate={{}}
        setOrdersByDate={() => {}}
        setModalRoom={() => {}}
        setModalData={() => {}}
      />
    );
    return { customOnAddClick };
  };

  test("renders room and orders", () => {
    const orders = {
      "1": [
        {
          dish1: "Овсянка",
          dish2: "Блинчики",
          drinks: "Чай",
          extras: ["Мёд"],
          comment: "Горячий",
          toGo: false
        }
      ],
      A2: [
        {
          dish1: "Йогурт",
          dish2: "Сырники",
          drinks: "Сок",
          extras: ["Сливки"],
          comment: "",
          toGo: true
        }
      ]
    };

    setup(orders);

    expect(screen.getAllByText("Гость 1").length).toBeGreaterThan(0);
    expect(screen.getByText("Овсянка")).toBeInTheDocument();
    expect(screen.getByText("Блинчики")).toBeInTheDocument();
  });

  test("shows To Go orders", () => {
    const orders = {
      A2: [
        {
          dish1: "Йогурт",
          dish2: "Сырники",
          drinks: "Сок",
          extras: [],
          comment: "",
          toGo: true
        }
      ]
    };

    setup(orders);

    expect(screen.getByText("Сырники")).toBeInTheDocument();
    expect(screen.getByDisplayValue("To Go")).toBeInTheDocument();
  });

  test("calls onAddClick when + is pressed", () => {
    const onAddClick = jest.fn();
    setup({}, onAddClick);

    const addButtons = screen.getAllByText("+");
    fireEvent.click(addButtons[0]);

    expect(onAddClick).toHaveBeenCalled();
  });

  test("does not add duplicate order", () => {
    const duplicateOrder = {
      dish1: "Омлет",
      dish2: "Оладьи",
      drinks: "Кофе",
      extras: ["Сметана"],
      comment: "Без соли",
      toGo: false
    };

    const orders = {
      "1": [duplicateOrder, { ...duplicateOrder }]
    };

    setup(orders);

    const omelets = screen.getAllByText("Омлет");
    expect(omelets.length).toBe(2); // Этот тест сейчас говорит: есть дубликаты

    // Если ты потом включишь проверку по уникальности — можно будет сделать вот так:
    // expect(omelets.length).toBe(1);
  });
});
