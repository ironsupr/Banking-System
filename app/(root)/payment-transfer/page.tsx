import HeaderBox from "@/components/HeaderBox";
import PaymentTransferForm from "@/components/PaymentTransferForm";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Transfer = async () => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  if (!accounts) return;

  const accountsData = accounts?.data;

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Transfer Funds"
        subtext="Send money to other bank accounts securely and quickly"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="header-2">Transfer Money</h2>
          <div className="flex items-center gap-2 text-14 text-gray-600">
            <Image src="/icons/payment-transfer.svg" width={20} height={20} alt="payment transfer info" />
            <span>You need the recipient's Plaid Shareable ID to transfer funds</span>
          </div>
        </div>

        {accountsData && accountsData.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <PaymentTransferForm accounts={accountsData} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Image
              src="/icons/money-send.svg"
              width={120}
              height={120}
              alt="empty"
              className="mb-4 opacity-50"
            />
            <h3 className="text-20 font-semibold text-gray-900">No Bank Accounts</h3>
            <p className="mt-2 text-14 text-gray-600">
              You need to add a bank account before you can transfer funds.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-white hover:bg-lime-700"
            >
              <Image src="/icons/plus.svg" width={20} height={20} alt="plus" />
              <span className="text-14 font-semibold">Add Bank</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Transfer;
