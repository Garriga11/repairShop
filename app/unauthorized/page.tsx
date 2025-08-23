// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1> Access Denied</h1>
      <p>You don’t have permission to view this page.</p>
      <a href="/dashboard">Go back to dashboard</a>
    </div>
  );
}
