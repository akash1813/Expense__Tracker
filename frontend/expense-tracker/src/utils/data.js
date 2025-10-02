import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuLogOut,
    LuUser,
    LuChartBar
}
from 'react-icons/lu';

export const SIDE_MENU_DATA = [

    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/dashboard",
    },
    {
        id: "02",
        label: "Income",
        icon: LuWalletMinimal,
        path: "/income",
    },
    {
        id: "03",
        label: "Expense",
        icon: LuHandCoins,
        path: "/expense",
    },
    {
        id: "05",
        label: "Analytics",
        icon: LuChartBar,
        path: "/analytics",
    },
    {
        id: "04",
        label: "Profile",
        icon: LuUser,
        path: "/profile",
    },
    {
        id: "07",
        label: "Logout",
        icon: LuLogOut,
        path: "/logout",
    }

]