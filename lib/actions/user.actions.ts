'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";

import { plaidClient } from '@/lib/plaid';
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

if (!DATABASE_ID || !USER_COLLECTION_ID || !BANK_COLLECTION_ID) {
  throw new Error("Missing required environment variables");
}

export const getUserInfo = async ({ userId }: { userId: string }) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID,
      USER_COLLECTION_ID,
      [Query.equal('userId', [userId])]
    );

    if (user.documents.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const signIn = async ({ email, password }: { email: string; password: string }) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId });

    return parseStringify(user);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  try {
    const { email, firstName, lastName } = userData;
    const { account, database } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: 'personal',
    });

    if (!dwollaCustomerUrl) {
      throw new Error("Dwolla customer creation failed");
    }

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID,
      USER_COLLECTION_ID,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      }
    );

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error during sign up:", error);
    throw error;
  }
};

export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id });

    return parseStringify(user);
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    return null;
  }
};

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    cookies().delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    console.error("Error logging out:", error);
    return null;
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error("Error creating Plaid link token:", error);
    throw error;
  }
};

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID,
      BANK_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      }
    );

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("Error creating bank account:", error);
    throw error;
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) {
      throw new Error("Funding source creation failed");
    }

    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");

    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error("Error exchanging public token:", error);
    throw error;
  }
};

export const getBanks = async ({ userId }: { userId: string }) => {
  try {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      DATABASE_ID,
      BANK_COLLECTION_ID,
      [Query.equal('userId', [userId])]
    );

    return parseStringify(banks.documents);
  } catch (error) {
    console.error("Error fetching banks:", error);
    throw error;
  }
};

export const getBank = async ({ documentId }: { documentId: string }) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID,
      BANK_COLLECTION_ID,
      [Query.equal('$id', [documentId])]
    );

    if (bank.documents.length === 0) {
      throw new Error(`Bank with ID ${documentId} not found`);
    }

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error("Error fetching bank:", error);
    throw error;
  }
};

export const getBankByAccountId = async ({ accountId }: { accountId: string }) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID,
      BANK_COLLECTION_ID,
      [Query.equal('accountId', [accountId])]
    );

    if (bank.total !== 1) {
      return null;
    }

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error("Error fetching bank by account ID:", error);
    throw error;
  }
};
