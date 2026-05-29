import { useAuthStore } from "@/stores/auth.store";

export async function downloadAuthenticatedExport(url: string, filename: string) {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("You must be signed in to export data.");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/csv",
    },
  });

  if (!response.ok) {
    throw new Error("Export failed. Please try again.");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
