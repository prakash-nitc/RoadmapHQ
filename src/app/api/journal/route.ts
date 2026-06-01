import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ entry: null });
  }

  const date = new Date(dateParam);
  const log = await prisma.dailyLog.findFirst({
    where: {
      date: {
        gte: startOfDay(date),
        lt: endOfDay(date),
      },
    },
  });

  return NextResponse.json({ entry: log?.journalEntry ?? null });
}
