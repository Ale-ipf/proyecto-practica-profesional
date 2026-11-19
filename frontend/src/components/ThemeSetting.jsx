import { useTheme } from "../context/useTheme.js";

export default function ThemeSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="theme-setting">
      <legend>Tema de la aplicación</legend>
      <p>Elegí cómo querés ver las páginas de Alquileres Formosa.</p>
      <div className="theme-setting__options">
        <label className="theme-setting__option">
          <input
            type="radio"
            name="app-theme"
            value="dark"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
          />
          Oscuro
        </label>
        <label className="theme-setting__option">
          <input
            type="radio"
            name="app-theme"
            value="light"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
          />
          Claro
        </label>
      </div>
    </fieldset>
  );
}
