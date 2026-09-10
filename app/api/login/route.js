import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find the user by email
    const result = await db.execute({
      sql: `
        SELECT id, first_name, last_name, email, password, birthday
        FROM users
        WHERE email = ?
      `,
      args: [email],
    });

    if (result.rows.length === 0) {
      return Response.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return Response.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return Response.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          birthday: user.birthday,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return Response.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}