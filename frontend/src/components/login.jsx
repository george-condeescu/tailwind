import React from 'react';

export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('submit');
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-indigo-700">
      <div className="w-full max-w-xs bg-indigo-100 rounded p-5">
        <header>
          <img className="w-20 mx-auto mb-5" src="year-of-tiger.png" />
        </header>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-indigo-500" for="username">
              Username
            </label>
            <input
              className="w-full p-2 mb-6 text-indigo-700 border-b-2 border-indigo-500 outline-none bg-white "
              type="text"
              name="username"
            />
          </div>
          <div>
            <label className="block mb-2 text-indigo-500" for="password">
              Password
            </label>
            <input
              className="w-full p-2 mb-6 text-indigo-700 border-b-2 border-indigo-500 outline-none bg-white "
              type="password"
              name="password"
            />
          </div>
          <div>
            {/* <input className="w-full bg-indigo-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded" type="submit"/> */}
            <button
              className="w-full bg-indigo-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
        <footer>
          <a
            className="text-indigo-700 hover:text-pink-700 text-sm float-left"
            href="#"
          >
            Forgot Password?
          </a>
          <a
            className="text-indigo-700 hover:text-pink-700 text-sm float-right"
            href="#"
          >
            Create Account
          </a>
        </footer>
      </div>
    </div>
  );
}
