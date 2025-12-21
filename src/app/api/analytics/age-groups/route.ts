import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.transaction.groupBy({
      by: ["age"],
      _count: {
        id: true,
      },
      orderBy: {
        age: "asc",
      },
    });

    const buckets = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-60": 0,
      "60+": 0,
    };

    data.forEach((item) => {
      const age = item.age;
      const count = item._count.id;

      if (age >= 18 && age <= 25) buckets["18-25"] += count;
      else if (age >= 26 && age <= 35) buckets["26-35"] += count;
      else if (age >= 36 && age <= 45) buckets["36-45"] += count;
      else if (age >= 46 && age <= 60) buckets["46-60"] += count;
      else if (age > 60) buckets["60+"] += count;
    });

    const formatted = Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
