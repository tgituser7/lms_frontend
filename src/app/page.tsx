import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Learn Without Limits
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Access hundreds of courses taught by expert instructors. Level up your skills at your own pace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="bg-white text-primary-700 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg"
            >
              Browse Courses
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-700 transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Choose Our LMS?</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Everything you need to learn, teach, and grow in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience.', icon: '👨‍🏫' },
              { title: 'Track Your Progress', desc: 'Monitor your learning journey with detailed progress tracking.', icon: '📊' },
              { title: 'Learn Anywhere', desc: 'Access your courses on any device, anytime, anywhere.', icon: '📱' },
            ].map((f) => (
              <div key={f.title} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
        <p className="text-primary-100 mb-8 max-w-xl mx-auto">
          Join thousands of students already learning on our platform.
        </p>
        <Link
          href="/login"
          className="bg-white text-primary-700 px-10 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg inline-block"
        >
          Login to Learn
        </Link>
        <div className="mt-6">
          <Link href="/admin/login" className="text-primary-200 hover:text-white text-sm transition-colors">
            Admin Login →
          </Link>
        </div>
      </section>
    </div>
  );
}
