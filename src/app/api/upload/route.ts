import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import { z } from "zod";

// Schema for row validation
const transactionSchema = z.object({
  transaction_no: z.string().min(1, "Transaction number is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  full_name: z.string().min(1, "Full name is required"),
  age: z.coerce
    .number()
    .min(18, "Age must be between 18 and 90")
    .max(90, "Age must be between 18 and 90"),
  gender: z.enum(["Male", "Female", "Other"] as const, {
    message: "Gender must be Male, Female, or Other",
  }),
  amount: z.coerce.number({ message: "Amount must be a number" }),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();

    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/ /g, "_"),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: "CSV Parsing Error",
          details: parseResult.errors.map((e) => `Line ${e.row}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    const rows = parseResult.data;
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
    }

    const validRows: any[] = [];
    const errors: string[] = [];
    const seenTransactionNos = new Set<string>();

    // Validate rows
    for (let i = 0; i < rows.length; i++) {
      const row: any = rows[i];
      const rowNum = i + 2;

      // Check internal duplicates
      if (row.transaction_no && seenTransactionNos.has(row.transaction_no)) {
        errors.push(
          `Row ${rowNum}: Duplicate transaction_no '${row.transaction_no}' in file`
        );
        continue;
      }
      if (row.transaction_no) seenTransactionNos.add(row.transaction_no);

      const result = transactionSchema.safeParse(row);
      if (!result.success) {
        const formattedErrors = result.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        errors.push(`Row ${rowNum}: ${formattedErrors}`);
      } else {
        validRows.push(result.data);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation Failed", details: errors },
        { status: 400 }
      );
    }

    // Atomic Insert
    const insertedCount = await prisma.$transaction(async (tx) => {
      // Map validRows to DB format
      const dbRows = validRows.map((row) => ({
        transaction_no: row.transaction_no,
        date: new Date(row.date),
        full_name: row.full_name,
        age: row.age,
        gender: row.gender,
        amount: row.amount,
      }));

      const result = await tx.transaction.createMany({
        data: dbRows,
      });
      return result.count;
    });

    return NextResponse.json({
      message: "Data processed successfully",
      count: insertedCount,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Database Conflict",
          details: [
            "A transaction number in this file already exists in the database.",
          ],
        },
        { status: 409 }
      );
    }
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
