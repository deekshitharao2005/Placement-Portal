const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
const path = require("path");

// ---------- PARSERS ----------

// DS-A
const parseDSA = (data) => {
  return data.map((row) => ({
    roll: row["H. T. No"] || "",
    name: row["Name of Student"] || "",
    company: row["Company Name"] || "Not Placed",
    salary: row["FTE Details"] || "-"
  }));
};

// DS-B
const parseDSB = (data) => {
  return data.map((row) => ({
    roll: row["ROLL Number"] || "",
    name: row["PLACED STUDENT NAME"] || "",
    company: row["PLACED COMPANY"] || "",
    salary: row["PACKAGE"] || "-"
  }));
};

// CYS
const parseCYS = (data) => {
  return data.map((row) => ({
    roll: row["ROLL NUMBER"] || "",
    name: row["NAME"] || "",
    company: row["COMPANY NAME"] || "",
    salary: row["CTC"] || "-"
  }));
};

// AIDS
const parseAIDS = (data) => {
  return data.map((row) => ({
    roll: row["H. T. No."] || "",
    name: row["Name of the Student"] || "",
    company:
      row["Placed or not"] === "YES"
        ? row["If yes company &ctc"]
        : "Not Placed",
    salary:
      row["Placed or not"] === "YES"
        ? row["If yes company &ctc"]
        : "-"
  }));
};

router.get("/:branch", (req, res) => {
  try {
    const branch = req.params.branch;

    let filePath = "";
    let parser;

    if (branch === "DS-A") {
      filePath = path.join(__dirname, "../data/dsa.xlsx");
      parser = parseDSA;
    } else if (branch === "DS-B") {
      filePath = path.join(__dirname, "../data/dsb.xlsx");
      parser = parseDSB;
    } else if (branch === "CYS") {
      filePath = path.join(__dirname, "../data/cys.xlsx");
      parser = parseCYS;
    } else if (branch === "AIDS") {
      filePath = path.join(__dirname, "../data/aids.xlsx");
      parser = parseAIDS;
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    const result = parser(rawData);

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error reading data" });
  }
});

module.exports = router;