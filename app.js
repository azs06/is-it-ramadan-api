const express = require("express");
const axios = require("axios");
const dayjs = require("dayjs");

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint to check if it is Ramadan
app.get("/:country", async (req, res) => {
  const { country } = req.params;
  const { date } = req.query;

  try {
    // Parse the date from query or use today's date
    const parsedDate = date ? dayjs(date, "YYYY-MM-DD") : dayjs();
    if (!parsedDate.isValid()) {
      return res.status(400).json({
        error: "Invalid date format. Please use YYYY-MM-DD.",
      });
    }

    const formattedDate = parsedDate.format("DD-MM-YYYY");
    const [day, month, year] = formattedDate.split("-");

    // Send request to Aladhan API for the Gregorian to Hijri calendar
    const response = await axios.get(
      `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`
    );

    const hijriCalendar = response.data.data;
    const hijriDate = hijriCalendar.find(
      (entry) => entry.gregorian.date === formattedDate
    );

    if (!hijriDate) {
      return res.status(404).json({
        error: "No matching date found in the Hijri calendar.",
      });
    }

    // Check if the Hijri month is Ramadan
    const isRamadan = hijriDate.hijri.month.number === 9;

    // Return the response
    res.json({
      country: country.toUpperCase(),
      date: formattedDate,
      hijriMonth: hijriDate.hijri.month.en,
      isRamadan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch data from the Aladhan API.",
    });
  }
});

// Landing page or help
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Is It Ramadan API",
    example: "/:country?date=YYYY-MM-DD (e.g., /bd?date=2025-03-01)",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
