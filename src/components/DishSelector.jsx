import React from "react";
import { useMenu } from "./MenuProvider";

export default function DishSelector({ type, selected, onSelect, onClose }) {
  const [localSelection, setLocalSelection] = React.useState(selected);
  const { menu } = useMenu();

  const groupedMenu = React.useMemo(() => {
    const result = {
      dish1: [],
      dish2: [],
      drinks: [],
      extras: []
    };
    for (const item of menu) {
      if (result[item.group]) {
        result[item.group].push(item);
      }
    }
    return result;
  }, [menu]);

  const showCombinedMenu = type === "dish1" || type === "dish2";
  const isExtras = type === "extras";
  const isDrink = type === "drinks";

  const handleConfirm = () => {
    onSelect(localSelection);
  };

  const toggleExtra = (item) => {
    setLocalSelection((prev) => {
      if (!Array.isArray(prev)) return [item];
      return prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item];
    });
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 2000
    }}>
      <div style={{ background: "#fff", padding: 20, width: 400 }}>
        <h3>Выбрать {showCombinedMenu ? "блюдо" : isExtras ? "дополнительно" : "напиток"}</h3>

        <ul style={{ maxHeight: "300px", overflowY: "auto", listStyle: "none", padding: 0 }}>
          {showCombinedMenu ? (
            <>
              <li><strong>— Первое блюдо —</strong></li>
              {groupedMenu.dish1.map(item => (
                <li key={item.id}>
                  <label>
                    <input
                      type="radio"
                      name="dish"
                      value={item.name}
                      checked={localSelection === item.name}
                      onChange={() => setLocalSelection(item.name)}
                    /> {item.name}
                  </label>
                </li>
              ))}
              <li><strong>— Второе блюдо —</strong></li>
              {groupedMenu.dish2.map(item => (
                <li key={item.id}>
                  <label>
                    <input
                      type="radio"
                      name="dish"
                      value={item.name}
                      checked={localSelection === item.name}
                      onChange={() => setLocalSelection(item.name)}
                    /> {item.name}
                  </label>
                </li>
              ))}
            </>
          ) : isExtras ? (
            groupedMenu.extras.map(item => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={Array.isArray(localSelection) && localSelection.includes(item.name)}
                    onChange={() => toggleExtra(item.name)}
                  /> {item.name}
                </label>
              </li>
            ))
          ) : isDrink ? (
            groupedMenu.drinks.map(item => (
              <li key={item.id}>
                <label>
                  <input
                    type="radio"
                    name="drink"
                    value={item.name}
                    checked={localSelection === item.name}
                    onChange={() => setLocalSelection(item.name)}
                  /> {item.name}
                </label>
              </li>
            ))
          ) : null}
        </ul>

        <div style={{ marginTop: 15, display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleConfirm}>ОК</button>
        </div>
      </div>
    </div>
  );
}
