import HeaderBox from "@/components/HeaderBox";
import { Pagination } from "@/components/Pagination";
import TransactionsTable from "@/components/TransactionsTable";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const TransactionHistory = async ({
  searchParams: { id, page },
}: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  if (!accounts) return;

  const accountsData = accounts?.data;
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  const account = await getAccount({ appwriteItemId });

  const rowsPerPage = 10;
  const totalPages = Math.ceil(account?.transactions.length / rowsPerPage);

  const indexOfLastTransaction = currentPage * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

  const currentTransactions = account?.transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox
          title="Transaction History"
          subtext="See your bank details and transactions."
        />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/connect-bank.svg"
                width={24}
                height={24}
                alt="bank"
                className="rounded-full bg-white/10 p-1"
              />
              <h2 className="text-18 font-bold text-white">
                {account?.data.name}
              </h2>
            </div>
            <p className="text-14 text-white/80">{account?.data.officialName}</p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● {account?.data.mask}
            </p>
          </div>

          <div className="transactions-account-balance">
            <p className="text-14 text-white/80">Current balance</p>
            <p className="text-24 text-center font-bold text-white">
              {formatAmount(account?.data.currentBalance)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="header-2">Recent Transactions</h2>
          <div className="flex items-center gap-4">
            <Link
              href="/payment-transfer"
              className="flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-white hover:bg-lime-700"
            >
              <Image src="/icons/money-send.svg" width={20} height={20} alt="transfer" />
              <span className="text-14 font-semibold">Transfer Money</span>
            </Link>
          </div>
        </div>

        <section className="flex w-full flex-col gap-6">
          {currentTransactions && currentTransactions.length > 0 ? (
            <>
              <TransactionsTable transactions={currentTransactions} />
              {totalPages > 1 && (
                <div className="my-4 w-full">
                  <Pagination totalPages={totalPages} page={currentPage} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <Image
                src="/icons/transaction.svg"
                width={120}
                height={120}
                alt="empty"
                className="mb-4 opacity-50"
              />
              <h3 className="text-20 font-semibold text-gray-900">No Transactions</h3>
              <p className="mt-2 text-14 text-gray-600">
                You haven't made any transactions yet. Start by transferring money to another account.
              </p>
              <Link
                href="/payment-transfer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-white hover:bg-lime-700"
              >
                <Image src="/icons/money-send.svg" width={20} height={20} alt="transfer" />
                <span className="text-14 font-semibold">Transfer Money</span>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TransactionHistory;
