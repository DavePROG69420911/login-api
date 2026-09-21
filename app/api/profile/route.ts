import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      type,
      profileImage,
      backgroundImage,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // =========================
    // UPDATE PROFILE PICTURE
    // =========================

    if (type === "profile") {
      if (!profileImage) {
        return NextResponse.json(
          { error: "Profile image is required." },
          { status: 400 }
        );
      }

      const result = await db.execute({
        sql: `
          UPDATE users
          SET profile_image = ?
          WHERE id = ?
        `,
        args: [profileImage, userId],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json(
          { error: "User not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Profile picture updated successfully.",
      });
    }

    // =========================
    // UPDATE BACKGROUND
    // =========================

    if (type === "background") {
      if (!backgroundImage) {
        return NextResponse.json(
          { error: "Background image is required." },
          { status: 400 }
        );
      }

      const result = await db.execute({
        sql: `
          UPDATE users
          SET background_image = ?
          WHERE id = ?
        `,
        args: [backgroundImage, userId],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json(
          { error: "User not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Background updated successfully.",
      });
    }

    return NextResponse.json(
      { error: "Invalid update type." },
      { status: 400 }
    );
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update profile." },
      { status: 500 }
    );
  }
}