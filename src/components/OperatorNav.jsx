import { Link, useLocation } from "react-router-dom";

export default function OperatorNav() {
  const { pathname } = useLocation();
  const active = (path) =>
    pathname === path ? "text-blue-600 font-semibold" : "text-gray-600";

  return (
    <nav className="flex gap-8 border-b mb-6 p-3 bg-white">
      <Link to="/operator/dashboard" className={active("/operator/dashboard")}>
        Dashboard
      </Link>
      <Link to="/operator/add-bus" className={active("/operator/add-bus")}>
        Add Bus
      </Link>
      <Link to="/operator/payment" className={active("/operator/payment")}>
        Payment
      </Link>
      <Link to="/operator/bookings" className={active("/operator/bookings")}>
        Bookings
       </Link>
    </nav>
  );
}
