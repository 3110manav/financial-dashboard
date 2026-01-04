import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "ALL";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { transaction_no: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type === "INCOME") {
      where.amount = { gt: 0 };
    } else if (type === "EXPENSE") {
      where.amount = { lt: 0 };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
