import { lookupByContractAsync } from "@/lens";
import { successResponse, errorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{
    address: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { address } = await params;

    if (!address || !address.trim()) {
      return errorResponse("INVALID_ADDRESS", "A contract address must be provided.", 400);
    }

    const result = await lookupByContractAsync(address);

    if (!result.success) {
      const statusCode = result.error === "INVALID_ADDRESS" ? 400 : 404;
      return errorResponse(result.error, result.message, statusCode);
    }

    return successResponse({
      query: result.query,
      normalizedAddress: result.normalizedAddress,
      underlying: result.underlying,
      matchedRepresentation: result.matchedRepresentation,
    });
  } catch {
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred processing the contract lookup.", 500);
  }
}
