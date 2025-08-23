'use client'

export default function dashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 flex flex-col items-center p-8">
      <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500 mb-8">
        Dashboard
      </h1>
      <p className="text-lg text-gray-700">
        Welcome to your dashboard! Here you can manage your tickets, view analytics, and more.
      </p>
    </div>
  );
}       