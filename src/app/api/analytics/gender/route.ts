import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.transaction.groupBy({
      by: ["gender"],
      _count: {
        id: true,
      },
    });

    const formatted = data.map((item) => ({
      name: item.gender,
      value: item._count.id,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
