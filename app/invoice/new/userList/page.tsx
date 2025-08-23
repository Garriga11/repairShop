import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";



export default async function UserListPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin User") {
        redirect("/unauthorized");
    }

    const users = await prisma.user.findMany();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User List</h1>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">ID</th>
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Email</th>
                        <th className="py-3 px-6 text-left">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6">{user.id}</td>
                                <td className="py-3 px-6">{user.name}</td>
                                <td className="py-3 px-6">{user.email}</td>
                                <td className="py-3 px-6">{user.roleId}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center py-4">No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
