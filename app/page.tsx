export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome — Tech Equity Support Lab </h1>
      <p>Create tickets for technical help or log in as staff to manage requests.</p>
      <div className="flex gap-4">
        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Log in / Sign up</a>
        <a href="/user/dashboard" className="px-4 py-2 border rounded">User portal</a>
        <a href="/staff/dashboard" className="px-4 py-2 border rounded">Staff portal</a>
      </div>
    </div>
  )
}