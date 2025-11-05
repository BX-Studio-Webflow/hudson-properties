import { Listings } from "../../../../../types/Listings";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const REVALIDATE_SECONDS = 10 * 60;

export async function GET() {
  try {
    const baseURL = new URL(`https://nestiolistings.com/api/v2/listings/all/?property=8169`);
    const BASIC_AUTH_HEADER =
      "Basic " + Buffer.from(process.env.BASIC_AUTH!).toString("base64");

    const response = await fetch(baseURL.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: BASIC_AUTH_HEADER,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Listings = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
