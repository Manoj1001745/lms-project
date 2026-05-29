import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type AdminSession = {
  name: string;
  role: string;
};

type UserSession = {
  name: string;
  role: string;
};

async function fetchFromApi(path: string, token: string): Promise<Response | null> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function getAdminServerSession(): Promise<AdminSession | null> {
  const adminToken = (await cookies()).get("learninghun_admin_token")?.value;
  if (!adminToken) return null;

  const response = await fetchFromApi("/admin/me", adminToken);
  if (!response?.ok) return null;

  const payload = (await response.json()) as {
    admin?: { name?: string; role?: { slug?: string } };
  };

  const name = payload.admin?.name;
  const role = payload.admin?.role?.slug;

  if (!name || !role || !["super_admin", "admin"].includes(role)) {
    return null;
  }

  return { name, role };
}

export async function getUserServerSession(): Promise<UserSession | null> {
  const userToken = (await cookies()).get("learninghun_user_token")?.value;
  if (!userToken) return null;

  const response = await fetchFromApi("/user/me", userToken);
  if (!response?.ok) return null;

  const payload = (await response.json()) as {
    user?: { name?: string; role?: { slug?: string } };
  };

  const name = payload.user?.name;
  const role = payload.user?.role?.slug;

  if (!name || !role || !["student", "professor"].includes(role)) {
    return null;
  }

  return { name, role };
}

