import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { apiFetch } from "./api";

interface AuthResponse {
  token: string;
  user: { id: string; username: string };
}

export async function registerPasskey(username: string): Promise<AuthResponse> {
  const options = await apiFetch<any>("/auth/register/options", {
    method: "POST",
    body: JSON.stringify({ username }),
  });

  const registration = await startRegistration({ optionsJSON: options });

  return apiFetch<AuthResponse>("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({ username, response: registration }),
  });
}

export async function loginPasskey(username: string): Promise<AuthResponse> {
  const options = await apiFetch<any>("/auth/login/options", {
    method: "POST",
    body: JSON.stringify({ username }),
  });

  const authentication = await startAuthentication({ optionsJSON: options });

  return apiFetch<AuthResponse>("/auth/login/verify", {
    method: "POST",
    body: JSON.stringify({ username, response: authentication }),
  });
}
