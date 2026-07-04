import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="text-2xl font-bold mb-2">Welcome to TestWithMe</h1>
      <p className="text-sm text-slate-500 mb-8">Sign in with Google to start tracking your QA learning progress.</p>
      <GoogleSignInButton />
    </div>
  )
}
