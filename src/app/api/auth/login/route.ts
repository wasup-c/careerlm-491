import {
    NextResponse,
  } from "next/server";
  
  import {
    getDefaultAuthService,
  } from "@/lib/auth/default-auth-service";
  
  import {
    InvalidCredentialsError,
  } from "@/lib/auth/errors";
  
  import {
    createSessionCookieOptions,
    SESSION_COOKIE_NAME,
  } from "@/lib/auth/session-cookie";
  
  interface Credentials {
    email: string;
    password: string;
  }
  
  function readCredentials(
    body: unknown
  ): Credentials | null {
    if (
      typeof body !==
        "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return null;
    }
  
    const record =
      body as Record<
        string,
        unknown
      >;
  
    if (
      typeof record.email !==
        "string" ||
      typeof record.password !==
        "string"
    ) {
      return null;
    }
  
    return {
      email:
        record.email,
      password:
        record.password,
    };
  }
  
  export async function POST(
    request: Request
  ): Promise<Response> {
    let body: unknown;
  
    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code:
              "VALIDATION_ERROR",
            message:
              "Request body must contain valid JSON.",
          },
        },
        {
          status: 400,
        }
      );
    }
  
    const credentials =
      readCredentials(body);
  
    if (!credentials) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code:
              "VALIDATION_ERROR",
            message:
              "Email and password are required.",
          },
        },
        {
          status: 400,
        }
      );
    }
  
    try {
      const session =
        await getDefaultAuthService()
          .login(
            credentials.email,
            credentials.password
          );
  
      const response =
        NextResponse.json({
          success: true,
          user:
            session.user,
        });
  
      response.cookies.set(
        SESSION_COOKIE_NAME,
        session.token,
        createSessionCookieOptions(
          new Date(
            session.expiresAt
          )
        )
      );
  
      return response;
    } catch (error) {
      if (
        error instanceof
          InvalidCredentialsError
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code:
                "INVALID_CREDENTIALS",
              message:
                "Invalid email or password.",
            },
          },
          {
            status:
              error.status,
          }
        );
      }
  
      return NextResponse.json(
        {
          success: false,
          error: {
            code:
              "AUTH_UNAVAILABLE",
            message:
              "CareerLM could not log you in right now. Please try again.",
          },
        },
        {
          status: 503,
        }
      );
    }
  }