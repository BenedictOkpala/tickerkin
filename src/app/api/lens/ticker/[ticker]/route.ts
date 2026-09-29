import { lookupByTickerAsync } from "@/lens";
import { successResponse, errorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{
    ticker: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { ticker } = await params;

    if (!ticker || !ticker.trim()) {
      return errorResponse("INVALID_TICKER", "A valid equity ticker must be provided.", 400);
    }

    const result = await lookupByTickerAsync(ticker);

    if (!result.success) {
      return errorResponse(result.error, result.message, 404);
    }

    return successResponse({
      query: result.query,
      underlying: result.underlying,
      representations: result.representations,
    });
  } catch {
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred processing the ticker lookup.", 500);
  }
}
