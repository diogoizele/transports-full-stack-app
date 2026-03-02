import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

import { pool } from "../db/connection";

export const authRoutes = express.Router();

authRoutes.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Login e senha são obrigatórios" });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
              id,
              nome as full_name,
              login as username,
              senha as password,
              empresa_id as company_id
            FROM
              usuario
            WHERE
              login = ?`,
      [username],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET cannot retrieve");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        fullName: user.full_name,
        companyId: user.company_id,
      },
      jwtSecret,
      { expiresIn: "8h" },
    );

    return res.json({
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno" });
  }
});
