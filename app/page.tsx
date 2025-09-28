import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="CivicLab Logo"
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="sr-only">CivicLab</span>
          </Link>
        </header>

        <section className="mt-24 grid gap-8 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Resolve IT issues faster with{" "}

            <span className="text-emerald-700">CivicLab</span>
          </h1>
          <p className="mx-auto max-w-2xl text-slate-600">
            A nation-wide centralized tech support system.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-700 px-5 py-3 text-white shadow-sm hover:bg-slate-800"
            >
              Customer Portal
            </Link>
            <Link
              href="/staff/tickets"
              className="rounded-xl border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-50"
            >
              Staff Portal
            </Link>
          </div>
        </section>

        <section className="mt-32 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Meet Our Team
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            We’re a group of students who are building a nationwide IT support platform that consolidates fragmented
            help desks across organizations and serves individuals.
          </p>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            We aim to create jobs across campuses to combine AI-powered troubleshooting with student tech support
            specialists, while providing equal access to technical assistance.
          </p>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            We deliver reliable, scalable technical support regardless of organization size, location, or user type.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {name: "Bookashee Diba"},
              {name: "Soham Harkare"},
              {name: "Kenean"},
              {name: "Vaishnavi Sinha"},
            ].map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div
                  className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
