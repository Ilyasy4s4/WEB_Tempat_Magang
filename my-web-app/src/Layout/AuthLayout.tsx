import { Outlet } from "react-router-dom";

export default function AuthLayouts() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-stretch">
      <Outlet />
    </div>
  );
}