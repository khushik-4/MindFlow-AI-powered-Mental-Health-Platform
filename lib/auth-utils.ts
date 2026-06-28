import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyAuthToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string };
    return decoded;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export function signAuthToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function getUserIdFromRequest(request: Request): string | null {
  try {
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?<=auth_token=)[^;]*/)?.[0] ||
        cookieHeader.match(/(?<=privy_auth_token=)[^;]*/)?.[0];
      token = match;
    }

    if (!token) return null;
    const claims = verifyAuthToken(token);
    return claims?.userId || null;
  } catch (error) {
    return null;
  }
}