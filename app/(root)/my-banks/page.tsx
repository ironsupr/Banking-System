import BankCard from "@/components/BankCard";
import HeaderBox from "@/components/HeaderBox";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Account } from "@/types";

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activities."
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="header-2">Your Cards</h2>
            <Link href="/" className="flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-white hover:bg-lime-700">
              <Image src="/icons/plus.svg" width={20} height={20} alt="plus" />
              <span className="text-14 font-semibold">Add Bank</span>
            </Link>
          </div>

          {accounts && accounts.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.data.map((account: Account) => (
                <div key={account.id} className="transform transition-transform hover:scale-105">
                  <BankCard
                    account={account}
                    userName={loggedIn?.firstName}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <Image
                src="/icons/connect-bank.svg"
                width={120}
                height={120}
                alt="empty"
                className="mb-4 opacity-50"
              />
              <h3 className="text-20 font-semibold text-gray-900">No Bank Accounts</h3>
              <p className="mt-2 text-14 text-gray-600">
                You haven't added any bank accounts yet. Add your first bank account to get started.
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
      </div>
    </section>
  );
};

export default MyBanks;
