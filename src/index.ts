interface Env {
  DELIVERY_TOKEN: string;
}

interface SuccessResponse {
  success: boolean;
  msg: string;
  data: {
    tat: number;
  };
}

interface ErrorResponse {
  success: boolean;
  msg: string;
  data: string;
}

const ORIGIN_PINCODE = "201301";
const MODE_OF_TRANSPORT = "E";

const BASE_URL = "https://track.delhivery.com/api/dc/expected_tat";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    try {
      const { searchParams } = new URL(request.url);

      const destinationPincode = searchParams.get("pincode");

      if (!destinationPincode) {
        return Response.json(
          {
            error: "Pincode is required",
          },
          {
            status: 400,
            headers: corsHeaders(),
          },
        );
      }

      // Call delivery API
      const response = await fetch(
        `${BASE_URL}?origin_pin=${ORIGIN_PINCODE}&destination_pin=${destinationPincode}&mot=${MODE_OF_TRANSPORT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${env.DELIVERY_TOKEN}`,
          },
        },
      );

      const data: SuccessResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        return Response.json(data, {
          status: response.status,
          headers: corsHeaders(),
        });
      }

      return Response.json(data, {
        status: 200,
        headers: corsHeaders(),
      });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        {
          status: 500,
          headers: corsHeaders(),
        },
      );
    }
  },
} satisfies ExportedHandler<Env>;
