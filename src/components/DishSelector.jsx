import React from "react";

export default function DishSelector({ type, items, selected, onSelect, onClose }) {
  const [localSelection, setLocalSelection] = React.useState(selected);

  const fullMenu = React.useMemo(() => {
    try {
      const stored = localStorage.getItem("menu");
      const parsed = stored ? JSON.parse(stored) : {};
      return {
        dish1: parsed.dish1 || [],
        dish2: parsed.dish2 || [],
        drinks: parsed.drinks || [],
        extras: parsed.extras || []
      };
    } catch {
      return { dish1: [], dish2: [], drinks: [], extras: [] };
    }
  }, []);

  const handleConfirm = () => {
    onSelect(localSelection);
  };

  const showCombinedMenu = type === 'dish1' || type === 'dish2';
  const isExtras = type === 'extras';
  const isDrink = type === 'drinks';

  const toggleExtra = (item) => {
    setLocalSelection(prev => {
      if (!Array.isArray(prev)) return [item];
      return prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item];
    });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000
    }}>
      <div style={{ background: "#fff", padding: 20, width: 400 }}>
        <h3>Выбрать {showCombinedMenu ? 'блюдо' : isExtras ? 'дополнительно' : 'напиток'}</h3>

        <ul style={{ maxHeight: "300px", overflowY: "auto", listStyle: 'none', padding: 0 }}>
          {showCombinedMenu ? (
            <>
              <li><strong>— Первое блюдо —</strong></li>
              {fullMenu.dish1.map(item => (
                <li key={`dish1-${item}`}>
                  <label>
                    <input
                      type="radio"
                      name="dish"
                      value={item}
                      checked={localSelection === item}
                      onChange={() => setLocalSelection(item)}
                    /> {item}
                  </label>
                </li>
              ))}
              <li><strong>— Второе блюдо —</strong></li>
              {fullMenu.dish2.map(item => (
                <li key={`dish2-${item}`}>
                  <label>
                    <input
                      type="radio"
                      name="dish"
                      value={item}
                      checked={localSelection === item}
                      onChange={() => setLocalSelection(item)}
                    /> {item}
                  </label>
                </li>
              ))}
            </>
          ) : isExtras ? (
            fullMenu.extras.map(item => (
              <li key={`extra-${item}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={Array.isArray(localSelection) && localSelection.includes(item)}
                    onChange={() => toggleExtra(item)}
                  /> {item}
                </label>
              </li>
            ))
          ) : isDrink ? (
            fullMenu.drinks.map(item => (
              <li key={`drink-${item}`}>
                <label>
                  <input
                    type="radio"
                    name="drink"
                    value={item}
                    checked={localSelection === item}
                    onChange={() => setLocalSelection(item)}
                  /> {item}
                </label>
              </li>
            ))
          ) : null}
        </ul>

        <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleConfirm}>ОК</button>
        </div>
      </div>
    </div>
  );
}
