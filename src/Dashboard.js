import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./styles.css";
import logo from "./logo_off.png";

const COLORS_MANIFESTS = ["#3498db", "#2980b9", "#1abc9c"];
const COLORS_INSTRUCTIONS = ["#e67e22", "#d35400"];
const COLORS_REQUESTS = ["#27ae60", "#16a085"];
const COLORS_INVOICES = [
  "#f39c12",
  "#e74c3c",
  "#9b59b6",
  "#2ecc71",
  "#d35400",
  "#c0392b",
  "#8e44ad",
  "#3498db",
  "#1abc9c",
  "#34495e",
  "#7f8c8d",
];

const Dashboard = ({ onLogout }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startWeek, setStartWeek] = useState("");
  const [endWeek, setEndWeek] = useState("");

  // Nahrání souboru a aktualizace dat
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      setData(sheet);
      setFilteredData(sheet);
    };
    reader.readAsBinaryString(file);
  };

  // Filtr týdnů
  const handleFilter = () => {
    if (!startWeek || !endWeek) return;
    const filtered = data.filter(
      (row) =>
        row["Týden"] >= Number(startWeek) && row["Týden"] <= Number(endWeek)
    );
    setFilteredData(filtered);
  };

  const createPieData = (totalKey, subKeys, colors) => {
    if (filteredData.length === 0) return [];

    return subKeys
      .map((key, index) => ({
        name: key,
        value: filteredData.reduce((sum, row) => sum + (row[key] || 0), 0),
        fill: colors[index % colors.length],
      }))
      .filter((item) => item.value > 0);
  };

  useEffect(() => {
    if (startWeek && endWeek) {
      handleFilter(); // Aplikování filtru při změně týdnů
    }
  }, [startWeek, endWeek, data]);

  // Funkce pro výpočet procenta
  // Funkce pro výpočet procenta
  // Funkce pro výpočet procenta
  const calculatePercentage = (key, totalKey, isSpecialCase = false) => {
    if (filteredData.length === 0) return 0;

    if (isSpecialCase) {
      // Počet úspěšně odeslaných žádostí
      const successfulRequests = filteredData.reduce(
        (sum, row) =>
          sum + (row["Žádost o instrukce byla úspěšně odeslána"] || 0),
        0
      );

      // Počet neúspěšně odeslaných žádostí
      const failedRequests = filteredData.reduce(
        (sum, row) =>
          sum +
          (row[
            "Žádost o instrukce nelze odeslat - žádní adresáti ve vstupní tabulce"
          ] || 0),
        0
      );

      const totalRequests = successfulRequests + failedRequests;

      if (totalRequests > 0) {
        // Vypočítáme procento pro úspěšně odeslané žádosti
        const successfulPercentage = (successfulRequests / totalRequests) * 100;

        // Vypočítáme procento pro neúspěšné žádosti tak, aby součet dal 100%
        const failedPercentage = 100 - successfulPercentage;

        return Math.round(successfulPercentage); // Procento úspěšně odeslaných
      } else {
        return 0;
      }
    } else {
      // Standardní výpočet pro ostatní případy
      let total = filteredData.reduce(
        (sum, row) => sum + (row[totalKey] || 0),
        0
      );
      let value = filteredData.reduce((sum, row) => sum + (row[key] || 0), 0);

      return total > 0 ? Math.round((value / total) * 100) : 0;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />

        <h1 className="dashboard-title">Aiviro Dashboard</h1>
        <div className="button-container">
          <button className="common-button logout-button" onClick={onLogout}>
            Odhlásit se
          </button>
          <label
            htmlFor="file-upload"
            className="common-button custom-file-upload"
          >
            Vybrat soubor
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: "none" }} // Skrytí standardního inputu
          />
        </div>
      </header>

      <div className="filter-container">
        <label>Filtr týdnů:</label>
        <input
          type="number"
          placeholder="Od týdne"
          value={startWeek}
          onChange={(e) => setStartWeek(e.target.value)}
        />
        <input
          type="number"
          placeholder="Do týdne"
          value={endWeek}
          onChange={(e) => setEndWeek(e.target.value)}
        />
        <button onClick={handleFilter}>Filtrovat</button>
      </div>

      <div className="charts-grid">
        {/* 📊 Sloupcový graf: Celkem Manifestů */}
        <div className="chart-card">
          <h2>
            Celkem Manifestů:{" "}
            {filteredData.reduce(
              (sum, row) => sum + (row["Celkem manifestů"] || 0),
              0
            )}
          </h2>
          <BarChart
            width={500}
            height={400}
            data={createPieData(
              "Celkem manifestů",
              [
                "Manifesty úspěšně alokovány a přesunuty",
                "Manifesty alokovány s chybou",
                "Nezpracované manifesty - pro číslo manifestu již existuje adresář s daty",
              ],
              COLORS_MANIFESTS
            )}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`: ${value}`]} />
            <Bar dataKey="value" fill="#3498db" />
          </BarChart>
        </div>

        {/* 🥧 Koláčový graf: Celkem Instrukcí */}
        <div className="chart-card">
          <h2>
            Celkem Instrukcí:{" "}
            {filteredData.reduce(
              (sum, row) => sum + (row["Celkem instrukcí"] || 0),
              0
            )}
          </h2>
          <PieChart width={500} height={400}>
            <Pie
              data={createPieData(
                "Celkem instrukcí",
                ["Instrukce úspěšně zpracovány"],
                COLORS_INSTRUCTIONS
              )}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            />
            <Tooltip formatter={(value) => `${value}`} />
          </PieChart>
        </div>

        {/* 📈 Spojnicový graf: Žádosti o Instrukce */}
        <div className="chart-card">
          <h2>
            Žádosti o Instrukce:{" "}
            {filteredData.reduce(
              (sum, row) =>
                sum +
                (row["Žádost o instrukce byla úspěšně odeslána"] || 0) +
                (row[
                  "Žádost o instrukce nelze odeslat - žádní adresáti ve vstupní tabulce"
                ] || 0),
              0
            )}
          </h2>
          <PieChart width={500} height={400}>
            <Pie
              data={createPieData(
                "Žádosti o instrukce",
                [
                  "Žádost o instrukce byla úspěšně odeslána",
                  "Žádost o instrukce nelze odeslat - žádní adresáti ve vstupní tabulce",
                ],
                COLORS_REQUESTS
              )}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            />
            <Tooltip formatter={(value) => `${value}`} />
          </PieChart>
        </div>

        {/* 🥧 Koláčový graf: Celkem Faktur + všechny chyby */}
        <div className="chart-card">
          <h2>
            Celkem Faktur:{" "}
            {filteredData.reduce(
              (sum, row) => sum + (row["Celkem faktur"] || 0),
              0
            )}
          </h2>
          <BarChart
            width={500}
            height={400}
            data={createPieData(
              "Celkem faktur",
              [
                "Faktury úspěšně zpracovány",
                "Chyba při zpracování faktury - pro fakturu neexistuje adresář s manifestem",
                "Chyba při zpracování faktury - pro fakturu nebyl nalezen manifest",
                "Chyba při zpracování faktury - položky faktury zvalidovány s chybami",
                "Chyba při zpracování faktury - název odběratele nebyl nalezen",
                "Chyba při zpracování faktury - název dodavatele nebyl nalezen",
                "Chyba při zpracování faktury - odběratel nebo dodavatel nebyl nalezen v databázi",
                "Chyba při zpracování faktury - list položek je prázdný",
                "Chyba při zpracování faktury - nebylo nalezeno číslo faktury",
                "Chyba při zpracování faktury - nebyly vyčteny povinné údaje z příloh",
                "Chyba při zpracování faktury - název ani DIČ odběratele či dodavatele nebyly nalezeny",
              ],
              COLORS_INVOICES
            )}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`: ${value}`]} />
            <Bar dataKey="value" fill="#3498db" />
          </BarChart>
        </div>
      </div>

      {/* Statistiky - přesunuto pod grafy */}
      {/* Statistiky - přesunuto pod grafy */}
      <div className="statistics-container">
        {/* Manifesty */}
        <h3 className="statistics-title">Statistika manifestů</h3>
        <div className="statistics-card manifest-statistics">
          <h3>Manifesty úspěšně alokovány a přesunuty</h3>
          <p className="percentage">
            {calculatePercentage(
              "Manifesty úspěšně alokovány a přesunuty",
              "Celkem manifestů"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card manifest-statistics">
          <h3>Manifesty alokovány s chybou</h3>
          <p className="percentage">
            {calculatePercentage(
              "Manifesty alokovány s chybou",
              "Celkem manifestů"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card manifest-statistics">
          <h3>
            Nezpracované manifesty - pro číslo manifestu již existuje adresář s
            daty
          </h3>
          <p className="percentage">
            {calculatePercentage(
              "Nezpracované manifesty - pro číslo manifestu již existuje adresář s daty",
              "Celkem manifestů"
            )}{" "}
            %
          </p>
        </div>

        {/* Instrukce */}
        <h3 className="statistics-title">Statistika instrukcí</h3>
        <div className="statistics-card instructions-statistics">
          <h3>Instrukce úspěšně zpracovány</h3>
          <p className="percentage">
            {calculatePercentage(
              "Instrukce úspěšně zpracovány",
              "Celkem instrukcí"
            )}{" "}
            %
          </p>
        </div>

        {/* Žádosti o instrukce */}
        {/* Žádosti o instrukce */}
        {/* Žádosti o instrukce */}
        <div className="statistics-card requests-statistics">
          <h3>Žádost o instrukce byla úspěšně odeslána</h3>
          <p className="percentage">
            {calculatePercentage(
              "Žádost o instrukce byla úspěšně odeslána",
              "Celkem instrukcí",
              true // označení speciálního případu
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card requests-statistics">
          <h3>
            Žádost o instrukce nelze odeslat - žádní adresáti ve vstupní tabulce
          </h3>
          <p className="percentage">
            {100 -
              calculatePercentage(
                "Žádost o instrukce byla úspěšně odeslána",
                "Celkem instrukcí",
                true // označení speciálního případu
              )}{" "}
            %
          </p>
        </div>

        {/* Faktury */}
        <h3 className="statistics-title">Statistika faktur</h3>
        <div className="statistics-card invoices-statistics">
          <h3>Faktury úspěšně zpracovány</h3>
          <p className="percentage">
            {calculatePercentage("Faktury úspěšně zpracovány", "Celkem faktur")}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>
            Chyba při zpracování faktury - pro fakturu neexistuje adresář s
            manifestem
          </h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - pro fakturu neexistuje adresář s manifestem",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>
            Chyba při zpracování faktury - pro fakturu nebyl nalezen manifest
          </h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - pro fakturu nebyl nalezen manifest",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>
            Chyba při zpracování faktury - položky faktury zvalidovány s chybami
          </h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - položky faktury zvalidovány s chybami",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>Chyba při zpracování faktury - název odběratele nebyl nalezen</h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - název odběratele nebyl nalezen",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>Chyba při zpracování faktury - název dodavatele nebyl nalezen</h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - název dodavatele nebyl nalezen",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>
            Chyba při zpracování faktury - odběratel nebo dodavatel nebyl
            nalezen v databázi
          </h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - odběratel nebo dodavatel nebyl nalezen v databázi",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>Chyba při zpracování faktury - list položek je prázdný</h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - list položek je prázdný",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>Chyba při zpracování faktury - nebylo nalezeno číslo faktury</h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - nebylo nalezeno číslo faktury",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>
            Chyba při zpracování faktury - nebyly vyčteny povinné údaje z příloh
          </h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - nebyly vyčteny povinné údaje z příloh",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
        <div className="statistics-card invoices-statistics">
          <h3>
            Chyba při zpracování faktury - název ani DIČ odběratele či
            dodavatele nebyly nalezeny
          </h3>
          <p className="percentage">
            {calculatePercentage(
              "Chyba při zpracování faktury - název ani DIČ odběratele či dodavatele nebyly nalezeny",
              "Celkem faktur"
            )}{" "}
            %
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
