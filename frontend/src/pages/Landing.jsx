import {
  Car,
  Users,
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Img from "/assets/ride.png";

function Landing() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-100'>
      {/* Navbar */}
      <nav className='max-w-7xl mx-auto flex items-center justify-between px-8 py-6'>
        <div className='flex items-center gap-3'>
          <div className='bg-yellow-400 p-3 rounded-xl shadow-lg'>
            <Car className='text-black w-6 h-6' />
          </div>

          <h1 className='text-3xl font-bold'>
            Ride<span className='text-yellow-500'>Link</span>
          </h1>
        </div>

        <div className='space-x-4'>
          <Link
            to='/login'
            className='px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition'
          >
            Login
          </Link>

          <Link
            to='/register'
            className='bg-yellow-400 hover:bg-yellow-500 transition px-6 py-2 rounded-full font-semibold shadow-lg'
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}

      <section className='max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center px-8 py-16'>
        {/* Left */}

        <div>
          <div className='inline-flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full mb-6'>
            🚖 Smart Shared Ride Platform
          </div>

          <h1 className='text-6xl font-extrabold leading-tight text-gray-900'>
            Share Rides.
            <br />
            Save Money.
            <br />
            Travel Smarter.
          </h1>

          <p className='text-gray-600 mt-8 text-lg leading-8'>
            RideLink connects passengers travelling in the same direction,
            reducing waiting time, lowering travel cost and helping drivers earn
            more through smart ride matching.
          </p>

          <div className='flex gap-5 mt-10'>
            <Link
              to='/register'
              className='bg-yellow-400 hover:bg-yellow-500 transition px-8 py-4 rounded-full font-semibold shadow-xl flex items-center gap-2'
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to='/login'
              className='border border-gray-300 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold'
            >
              Login
            </Link>
          </div>

          {/* Stats */}

          <div className='grid grid-cols-3 gap-6 mt-14'>
            <div className='bg-white rounded-2xl shadow-lg p-5'>
              <Users className='text-yellow-500' />

              <h2 className='text-2xl font-bold mt-2'>0</h2>

              <p className='text-gray-500'>Riders</p>
            </div>

            <div className='bg-white rounded-2xl shadow-lg p-5'>
              <ShieldCheck className='text-green-500' />

              <h2 className='text-2xl font-bold mt-2'>100%</h2>

              <p className='text-gray-500'>Verified Drivers</p>
            </div>

            <div className='bg-white rounded-2xl shadow-lg p-5'>
              <Star className='text-yellow-500 fill-yellow-400' />

              <h2 className='text-2xl font-bold mt-2'>0</h2>

              <p className='text-gray-500'>Rating</p>
            </div>
          </div>
        </div>

        {/* Right */}

        <div className='relative flex justify-center'>
          <div className='absolute w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-30'></div>

          <img src={Img} alt='RideLink' className='relative w-[520px]' />

          <div className='absolute top-8 left-4 bg-white shadow-xl rounded-xl p-4'>
            <div className='flex gap-2'>
              <MapPin className='text-red-500' />

              <div>
                <h3 className='font-semibold'>Pickup</h3>

                <p className='text-sm text-gray-500'>GNIOT College</p>
              </div>
            </div>
          </div>

          <div className='absolute bottom-8 right-0 bg-white shadow-xl rounded-xl p-4'>
            <p className='font-semibold'>🚖 4 Seats Available</p>

            <p className='text-sm text-gray-500'>Driver arriving in 3 mins</p>
          </div>
        </div>
      </section>

      {/* Features */}

      <section className='max-w-7xl mx-auto px-8 py-20'>
        <h2 className='text-4xl font-bold text-center mb-14'>
          Why Choose RideLink?
        </h2>

        <div className='grid md:grid-cols-3 gap-8'>
          <div className='bg-white rounded-3xl shadow-lg p-8 hover:scale-105 duration-300'>
            <Users className='text-yellow-500 w-10 h-10' />

            <h3 className='font-bold text-2xl mt-5'>Shared Rides</h3>

            <p className='text-gray-500 mt-3'>
              Travel with people going in the same direction.
            </p>
          </div>

          <div className='bg-white rounded-3xl shadow-lg p-8 hover:scale-105 duration-300'>
            <MapPin className='text-red-500 w-10 h-10' />

            <h3 className='font-bold text-2xl mt-5'>Smart Matching</h3>

            <p className='text-gray-500 mt-3'>
              AI-based route matching for faster pickup.
            </p>
          </div>

          <div className='bg-white rounded-3xl shadow-lg p-8 hover:scale-105 duration-300'>
            <ShieldCheck className='text-green-500 w-10 h-10' />

            <h3 className='font-bold text-2xl mt-5'>Safe & Secure</h3>

            <p className='text-gray-500 mt-3'>
              Verified drivers with secure authentication.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className='bg-yellow-400 py-20'>
        <div className='max-w-5xl mx-auto text-center'>
          <h2 className='text-5xl font-bold'>Ready to Ride?</h2>

          <p className='mt-5 text-xl'>
            Join thousands of passengers using RideLink every day.
          </p>

          <Link
            to='/register'
            className='mt-10 inline-block bg-black text-white px-10 py-4 rounded-full text-lg hover:bg-gray-900 transition'
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;
