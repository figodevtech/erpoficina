import Cards from "./components/cards";
import FinancialTable from "./components/financialTable";
import Header from "./components/header";

export default function FinanceiroPage() {
    return(
        <div className="p-y-4 space-y-4">
            {/* <Header /> */}
            <Cards />
            <FinancialTable />
        </div>
    )
}