import HeaderBox from '@/components/HeaderBox';
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

interface SearchParamProps {
  searchParams: {
    id?: string;
    page?: string;
  };
}

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  try {
    // Get current page and logged-in user
    const currentPage = Number(page) || 1;
    const loggedIn = await getLoggedInUser();
    if (!loggedIn) {
      throw new Error("User is not logged in");
    }

    // Fetch accounts
    const accounts = await getAccounts({ userId: loggedIn.id });
    if (!accounts || !accounts.data || accounts.data.length === 0) {
      throw new Error("No accounts found");
    }

    const accountsData = accounts.data;
    const appwriteItemId = id || accountsData[0]?.appwriteItemId;

    if (!appwriteItemId) {
      throw new Error("No account ID provided");
    }

    // Fetch specific account details
    const account = await getAccount({ appwriteItemId });
    if (!account) {
      throw new Error("Account details not found");
    }

    // Render the Home page
    return (
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox
              type="greeting"
              title="Welcome"
              user={loggedIn.firstName || 'Guest'}
              subtext="Access and manage your account and transactions efficiently."
            />

            <TotalBalanceBox
              accounts={accountsData}
              totalBanks={accounts.totalBanks}
              totalCurrentBalance={accounts.totalCurrentBalance}
            />
          </header>

          <RecentTransactions
            accounts={accountsData}
            transactions={account.transactions}
            appwriteItemId={appwriteItemId}
            page={currentPage}
          />
        </div>

        <RightSidebar
          user={loggedIn}
          transactions={account.transactions}
          banks={accountsData.slice(0, 2)}
        />
      </section>
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in Home component:", error.message);
    } else {
      console.error("Error in Home component:", error);
    }
    return (
      <section className="home-error">
        <p>Something went wrong. Please try again later.</p>
      </section>
    );
  }
};

export default Home;