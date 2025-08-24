"use client";
import { ArrowRightIcon} from "@heroicons/react/16/solid";
import Link from "next/link";

export default  function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white shadow-2xl rounded-xl p-10 flex flex-col items-center w-full max-w-md">
        <ArrowRightIcon className="h-12 w-12 text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">A Demo Repair Shop App Secured By Next-Auth</h1>
        <p className="text-gray-600 mb-8 text-center">Please log in to access your dashboard.</p>
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors font-semibold">
          Login
        </Link>
      </div>
    </div>
  )
}