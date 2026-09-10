import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      password,
      birthday,
    } = body;

    // Check required fields
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !birthday
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    // LOWER() also handles accounts that were saved before
    // we started normalizing emails.
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE LOWER(email) = ?",
      args: [normalizedEmail],
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.execute({
      sql: `
        INSERT INTO users
        (first_name, last_name, email, password, birthday)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        first_name.trim(),
        last_name.trim(),
        normalizedEmail, // Always save lowercase
        hashedPassword,
        birthday,
      ],
    });

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}