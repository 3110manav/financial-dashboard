import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM-DD') as month,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as credit,
        SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as debit
      FROM "Transaction"
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY DATE_TRUNC('month', date) ASC
    `;

    const formatted = (data as any[]).map((row) => ({
      month: row.month,
      credit: Number(row.credit || 0),
      debit: Number(row.debit || 0),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Monthly trend error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
