import { FormEventHandler, useState } from "react";

import { useAppContext } from "../context/AppContext";

const SignIn: React.FC = () => {
  const { error, loading, signIn } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="flex items-center justify-center min-w-full">
      <div className="container flex-1 p-8 mx-auto space-y-8">
        <form
          className="max-w-lg p-16 mx-auto space-y-8"
          onSubmit={handleSubmit}
        >
          <img className="w-24" alt="Karns logo" src="/logo.png" />
          <h1 className="text-3xl font-semibold text-karns-500">
            Sign in to your account
          </h1>
          <label className="block" htmlFor="email">
            <span className="block text-sm font-medium text-gray-600">
              Email Address
            </span>
            <input
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-karns-500"
              disabled={loading}
              id="email"
              name="email"
              placeholder="rmalesic@karns.net"
              required
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </label>

          <label
            className="block text-sm font-medium text-gray-600"
            htmlFor="password"
          >
            <span className="block">Password</span>
            <input
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-karns-500"
              disabled={loading}
              id="password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </label>

          <button
            className="w-full px-3 py-2 text-sm font-medium text-white border rounded bg-karns-500 hover:bg-karns-600"
            disabled={loading}
            type="submit"
          >
            Sign In
          </button>

          {error && <span className="text-sm text-red-500">{error}</span>}
        </form>
      </div>

      <div className="flex-1 hidden min-h-screen bg-indigo-50 md:block" />
    </div>
  );
};

export default SignIn;
