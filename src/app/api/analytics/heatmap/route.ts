import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        EXTRACT(ISODOW FROM date) as day,
        COUNT(*) as count
      FROM "Transaction"
      GROUP BY EXTRACT(ISODOW FROM date)
      ORDER BY day ASC
    `;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const result = days.map((day, index) => {
      const dow = index + 1;
      const found = (data as any[]).find((r: any) => Number(r.day) === dow);
      return {
        day,
        value: found ? Number(found.count) : 0,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
