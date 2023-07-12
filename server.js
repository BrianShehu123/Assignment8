const express = require("express");
const app = express();
const port = 4000;
const { query } = require("./database");
require("dotenv").config();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    console.log(`Response Status: ${res.statusCode}`);
  });
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to the Book Inventory Management API!!!!");
});

app.get("/books", async (req, res) => {
  try {
    const allBooks = await query("SELECT * FROM book_inventories");
    res.status(200).json(allBooks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  try {
    const book = await query("SELECT * FROM book_inventories WHERE id = $1", [bookId]);
    if (book.rows.length > 0) {
      res.status(200).json(book.rows[0]);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/books", async (req, res) => {
  const { title, author, genre, quantity } = req.body;
  try {
    const newBook = await query(
      "INSERT INTO book_inventories (title, author, genre, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, author, genre, quantity]
    );
    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.patch("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const fieldNames = ["title", "author", "genre", "quantity", "bookId"].filter((name) => req.body[name]);
  const updatedValues = fieldNames.map((name) => req.body[name]);
  const setValues = fieldNames.map((name, i) => `${name} = $${i + 1}`).join(", ");
  try {
    const updatedBook = await query(
      `UPDATE book_inventories SET ${setValues} WHERE id = $${fieldNames.length + 1} RETURNING *`,
      [...updatedValues, bookId]
    );
    if (updatedBook.rows.length > 0) {
      res.status(200).json(updatedBook.rows[0]);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.delete("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  try {
    const deleteOp = await query("DELETE FROM book_inventories WHERE id = $1", [bookId]);
    if (deleteOp.rowCount > 0) {
      res.status(200).send({ message: "Book deleted successfully" });
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
