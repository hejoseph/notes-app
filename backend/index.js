require("dotenv").config();

import { connectionString } from "./config.json";
import { connect } from "mongoose";

connect(connectionString);

import User, { findOne } from "./models/user.model";
import Note, { findOne as _findOne } from "./models/note.model";

import express, { json } from "express";
import cors from "cors";
const app = express();

import { sign } from "jsonwebtoken";
import { authenticateToken } from "./utilities";

app.use(json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ data: "Hello" });
});


//Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }

  if (!email) {
    return res
      .status(400)
      .json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await findOne({ email: email });
  if (isUser) {
    return res
      .json({ error: true, message: "User already exists" });
  }

  const user = new User({
    fullName, email, password
  });

  await user.save();

  const accessToken = sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful"
  });

});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const userInfo = await findOne({ email: email });

  if (!userInfo) {
    return res.status(400).json({ message: "User not found" });
  }

  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo };
    const accessToken = sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m"
    });

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken
    });

  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid Credentials"
    });
  }



});

app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!content) {
    return res.status(400).json({ message: "content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully"
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error"
    });
  }

});

app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  let debug = "";
  const noteId = req.params.noteId;
  const { title, content, tags } = req.body;
  const { user } = req.user;

  debug = "160";
  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }
  debug = "167"
  try {
    const note = await _findOne({ _id: noteId, userId: user._id });
    debug = "170 "+noteId+ " "+user._id;
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    debug = "175"

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    debug = "182"
    await note.save();
    debug = "184"
    return res.json({
      error: false,
      note,
      message: "Note updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error " + debug
    });
  }

});

app.listen(8000);

export default app;