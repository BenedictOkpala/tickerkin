import { buildEquityComparisonAsync } from "@/lens/comparison";
import { successResponse, errorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{
    ticker: string;
  }>;
}

/**
 * GET /api/lens/ticker/:ticker/comparison
 * Returns normalized cross-representation comparison matrix for an equity.
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { ticker } = await params;

    if (!ticker || !ticker.trim()) {
      return errorResponse("INVALID_TICKER", "A valid equity ticker must be provided.", 400);
    }

    const comparison = await buildEquityComparisonAsync(ticker);

    if (!comparison) {
      return errorResponse(
        "TICKER_NOT_FOUND",
        `No verified comparison data found for ticker '${ticker.toUpperCase()}'.`,
        404
      );
    }

    return successResponse(comparison);
  } catch {
    return errorResponse(
      "INTERNAL_ERROR",
      "An unexpected error occurred processing the equity comparison.",
      500
    );
  }
}
