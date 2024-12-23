"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

export async function createSessionClient() {
  const client = new Client();

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  if (!endpoint || !project) {
    throw new Error("Environment variables for Appwrite endpoint or project are missing.");
  }

  client.setEndpoint(endpoint).setProject(project);

  const session = cookies().get("appwrite-session");

  if (!session || !session.value) {
    throw new Error("No session found in cookies.");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client();

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const key = process.env.NEXT_APPWRITE_KEY;

  if (!endpoint || !project || !key) {
    throw new Error("Environment variables for Appwrite admin configuration are missing.");
  }

  client.setEndpoint(endpoint).setProject(project).setKey(key);

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      return new Users(client);
    },
  };
}

