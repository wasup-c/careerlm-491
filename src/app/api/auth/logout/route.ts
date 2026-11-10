import {
    type NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    getDefaultAuthService,
  } from "@/lib/auth/default-auth-service";
  
  import {
    createClearedSessionCookieOptions,
    SESSION_COOKIE_NAME,
  } from "@/lib/auth/session-cookie";
  
  export async function POST(
    request: NextRequest
  ): Promise<Response> {
    const rawToken =
      request.cookies.get(
        SESSION_COOKIE_NAME
      )?.value;
  
    try {
      await getDefaultAuthService()
        .logout(
          rawToken
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code:
              "AUTH_UNAVAILABLE",
            message:
              "CareerLM could not end your session right now. Please try again.",
          },
        },
        {
          status: 503,
        }
      );
    }
  
    const response =
      NextResponse.json({
        success: true,
      });
  
    response.cookies.set(
      SESSION_COOKIE_NAME,
      "",
      createClearedSessionCookieOptions()
    );
  
    return response;
  }