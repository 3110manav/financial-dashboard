import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.transaction.groupBy({
      by: ["full_name"],
      where: {
        amount: {
          lt: 0,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "asc",
        },
      },
      take: 5,
    });

    const formatted = data.map((item) => ({
      name: item.full_name,
      total_spent: Math.abs(Number(item._sum.amount)),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
