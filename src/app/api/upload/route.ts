import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import { z } from "zod";

// Schema for row validation
const transactionSchema = z.object({
  transaction_no: z.string().min(1, "Transaction number is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  full_name: z.string().min(1, "Full name is required"),
  age: z.coerce.number().min(18, "Age must be between 18 and 90").max(90, "Age must be between 18 and 90"),
  gender: z.enum(["Male", "Female", "Other"], { errorMap: () => ({ message: "Gender must be Male, Female, or Other" }) }),
  amount: z.coerce.number({ invalid_type_error: "Amount must be a number" }),
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
      transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, "_"), // Normalize headers? No, assume keys match or map them.
      // Requirement says fields: transaction_no, date, etc.
      // User requirements didn't specify exact CSV headers, but implied mapping.
      // I'll assume CSV headers match the model fields for simplicity: transaction_no, date, full_name, age, gender, amount.
    });

    if (parseResult.errors.length > 0) {
       return NextResponse.json({ error: "CSV Parsing Error", details: parseResult.errors.map(e => `Line ${e.row}: ${e.message}`) }, { status: 400 });
    }

    const rows = parseResult.data;
    if (rows.length === 0) {
        return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
    }

    const validRows: any[] = [];
    const errors: string[] = [];
    const seenTransactionNos = new Set<string>();

    // Validate rows
    // Use for loop to access index
    for (let i = 0; i < rows.length; i++) {
       const row: any = rows[i];
       const rowNum = i + 2; // +1 for 0-index, +1 for header

       // Check internal duplicates
       if (row.transaction_no && seenTransactionNos.has(row.transaction_no)) {
           errors.push(`Row ${rowNum}: Duplicate transaction_no '${row.transaction_no}' in file`);
           continue; 
       }
       if (row.transaction_no) seenTransactionNos.add(row.transaction_no);

       const result = transactionSchema.safeParse(row);
       if (!result.success) {
         const formattedErrors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
         errors.push(`Row ${rowNum}: ${formattedErrors}`);
       } else {
         validRows.push(result.data);
       }
    }

    if (errors.length > 0) {
      // Reject entire file
      return NextResponse.json({ error: "Validation Failed", details: errors }, { status: 400 });
    }

    // Atomic Insert
    const insertedCount = await prisma.$transaction(async (tx) => {
      let count = 0;
      // We can use createMany for speed, but 'create' allows better error catching per row if we weren't valid.
      // Since we validated, createMany is safe and FASTER.
      // BUT createMany does not support 'skipDuplicates' on Postgres easily without unique constraint error for the whole batch.
      // If we want detailed error on DB duplicate, createMany is all-or-nothing.
      // Requirement: "transaction_no is unique".
      // If DB has it, createMany throws.
      // We'll use createMany.
      
      // Map validRows to DB format
      const dbRows = validRows.map(row => ({
         transaction_no: row.transaction_no,
         date: new Date(row.date),
         full_name: row.full_name,
         age: row.age,
         gender: row.gender,
         amount: row.amount
      }));

      // Check external duplicates (in DB) before insert?
      // Or just let DB constraint fail.
      // If DB fails, we return error "Duplicate transaction_no exists".
      
      const result = await tx.transaction.createMany({
        data: dbRows
      });
      return result.count;
    });

    return NextResponse.json({ message: "Data processed successfully", count: insertedCount });

  } catch (error: any) {
    if (error.code === 'P2002') {
       // P2002 is Unique constraint failed
       return NextResponse.json({ error: "Database Conflict", details: ["A transaction number in this file already exists in the database."] }, { status: 409 });
    }
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
