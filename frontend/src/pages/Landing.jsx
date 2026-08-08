import { Users, MapPin, ShieldCheck, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Img from "/assets/ride.png";

function Landing() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden'>
      {/* ================= NAVBAR ================= */}
      <nav className='w-full bg-white border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            {/* Logo */}
            <Link to='/' className='flex items-center'>
              <h1 className='text-2xl sm:text-3xl font-bold'>
                Ride<span className='text-yellow-500'>Link</span>
              </h1>
            </Link>

            {/* Desktop / Tablet Buttons */}
            <div className='flex items-center gap-2 sm:gap-4'>
              <Link
                to='/login'
                className='
                  px-4 sm:px-6
                  py-2
                  rounded-full
                  border border-gray-300
                  hover:bg-gray-100
                  transition
                  text-sm sm:text-base
                '
              >
                Login
              </Link>

              <Link
                to='/register'
                className='
                  bg-yellow-400
                  hover:bg-yellow-500
                  transition
                  px-4 sm:px-6
                  py-2
                  rounded-full
                  font-semibold
                  shadow-lg
                  text-sm sm:text-base
                '
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section
        className='
          max-w-7xl
          mx-auto
          px-4 sm:px-6 lg:px-8
          py-10 sm:py-14 lg:py-20
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-12
          lg:gap-16
          items-center
        '
      >
        {/* ---------- LEFT ---------- */}
        <div className='w-full'>
          {/* Badge */}
          <div
            className='
              inline-flex
              items-center
              bg-yellow-100
              text-yellow-700
              px-3 sm:px-4
              py-2
              rounded-full
              mb-5 sm:mb-6
              text-xs sm:text-sm
              font-medium
            '
          >
            🚖 Smart Shared Ride Platform
          </div>

          {/* Heading */}
          <h1
            className='
              text-4xl
              sm:text-5xl
              md:text-6xl
              lg:text-6xl
              font-extrabold
              leading-tight
              text-gray-900
            '
          >
            Share Rides.
            <br />
            Save Money.
            <br />
            Travel Smarter.
          </h1>

          {/* Description */}
          <p
            className='
              text-gray-600
              mt-6 sm:mt-8
              text-base sm:text-lg
              leading-7 sm:leading-8
              max-w-2xl
            '
          >
            RideLink connects passengers travelling in the same direction,
            reducing waiting time, lowering travel cost and helping drivers earn
            more through smart ride matching.
          </p>

          {/* Buttons */}
          <div className='flex flex-col xs:flex-row sm:flex-row gap-3 sm:gap-5 mt-8 sm:mt-10'>
            <Link
              to='/register'
              className='
                bg-yellow-400
                hover:bg-yellow-500
                transition
                px-6 sm:px-8
                py-3 sm:py-4
                rounded-full
                font-semibold
                shadow-xl
                flex
                items-center
                justify-center
                gap-2
                text-sm sm:text-base
                w-full sm:w-auto
              '
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to='/login'
              className='
                border border-gray-300
                hover:bg-gray-100
                px-6 sm:px-8
                py-3 sm:py-4
                rounded-full
                font-semibold
                text-sm sm:text-base
                flex
                items-center
                justify-center
                w-full sm:w-auto
              '
            >
              Login
            </Link>
          </div>

          {/* ---------- STATS ---------- */}
          <div
            className='
              grid
              grid-cols-3
              gap-2 sm:gap-4 lg:gap-6
              mt-10 sm:mt-14
            '
          >
            {/* Riders */}
            <div
              className='
                bg-white
                rounded-xl sm:rounded-2xl
                shadow-md sm:shadow-lg
                p-3 sm:p-5
              '
            >
              <Users className='text-yellow-500 w-5 h-5 sm:w-6 sm:h-6' />

              <h2 className='text-xl sm:text-2xl font-bold mt-2'>0</h2>

              <p className='text-gray-500 text-xs sm:text-sm'>Riders</p>
            </div>

            {/* Verified */}
            <div
              className='
                bg-white
                rounded-xl sm:rounded-2xl
                shadow-md sm:shadow-lg
                p-3 sm:p-5
              '
            >
              <ShieldCheck className='text-green-500 w-5 h-5 sm:w-6 sm:h-6' />

              <h2 className='text-xl sm:text-2xl font-bold mt-2'>100%</h2>

              <p className='text-gray-500 text-xs sm:text-sm'>Verified</p>
            </div>

            {/* Rating */}
            <div
              className='
                bg-white
                rounded-xl sm:rounded-2xl
                shadow-md sm:shadow-lg
                p-3 sm:p-5
              '
            >
              <Star className='text-yellow-500 fill-yellow-400 w-5 h-5 sm:w-6 sm:h-6' />

              <h2 className='text-xl sm:text-2xl font-bold mt-2'>0</h2>

              <p className='text-gray-500 text-xs sm:text-sm'>Rating</p>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT / IMAGE ---------- */}
        <div
          className='
            relative
            flex
            justify-center
            items-center
            w-full
            min-h-[320px]
            sm:min-h-[420px]
            lg:min-h-[500px]
          '
        >
          {/* Background Glow */}
          <div
            className='
              absolute
              w-64 h-64
              sm:w-80 sm:h-80
              lg:w-96 lg:h-96
              bg-yellow-300
              rounded-full
              blur-3xl
              opacity-30
            '
          ></div>

          {/* Ride Image */}
          <img
            src={Img}
            alt='RideLink'
            className='
              relative
              z-10
              w-[280px]
              sm:w-[380px]
              md:w-[450px]
              lg:w-[520px]
              max-w-full
              object-contain
            '
          />

          {/* ---------- PICKUP CARD ---------- */}
          <div
            className='
              absolute
              z-20
              top-2
              left-0
              sm:top-8
              sm:left-2
              lg:left-0
              bg-white
              shadow-xl
              rounded-xl
              p-3 sm:p-4
              max-w-[160px]
              sm:max-w-none
            '
          >
            <div className='flex gap-2 items-start'>
              <MapPin className='text-red-500 flex-shrink-0' size={20} />

              <div>
                <h3 className='font-semibold text-sm sm:text-base'>Pickup</h3>

                <p className='text-xs sm:text-sm text-gray-500'>
                  GNIOT College
                </p>
              </div>
            </div>
          </div>

          {/* ---------- SEATS CARD ---------- */}
          <div
            className='
              absolute
              z-20
              bottom-2
              right-0
              sm:bottom-8
              sm:right-2
              lg:right-0
              bg-white
              shadow-xl
              rounded-xl
              p-3 sm:p-4
              max-w-[190px]
              sm:max-w-none
            '
          >
            <p className='font-semibold text-xs sm:text-sm'>
              🚖 4 Seats Available
            </p>

            <p className='text-xs sm:text-sm text-gray-500 mt-1'>
              Driver arriving in 3 mins
            </p>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        className='
          max-w-7xl
          mx-auto
          px-4 sm:px-6 lg:px-8
          py-14 sm:py-20
        '
      >
        <h2
          className='
            text-3xl
            sm:text-4xl
            font-bold
            text-center
            mb-10 sm:mb-14
          '
        >
          Why Choose RideLink?
        </h2>

        <div
          className='
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5 sm:gap-8
          '
        >
          {/* Shared Rides */}
          <div
            className='
              bg-white
              rounded-2xl sm:rounded-3xl
              shadow-lg
              p-6 sm:p-8
              hover:scale-[1.02]
              sm:hover:scale-105
              transition
              duration-300
            '
          >
            <Users className='text-yellow-500 w-9 h-9 sm:w-10 sm:h-10' />

            <h3 className='font-bold text-xl sm:text-2xl mt-5'>Shared Rides</h3>

            <p className='text-gray-500 mt-3 text-sm sm:text-base leading-6'>
              Travel with people going in the same direction.
            </p>
          </div>

          {/* Smart Matching */}
          <div
            className='
              bg-white
              rounded-2xl sm:rounded-3xl
              shadow-lg
              p-6 sm:p-8
              hover:scale-[1.02]
              sm:hover:scale-105
              transition
              duration-300
            '
          >
            <MapPin className='text-red-500 w-9 h-9 sm:w-10 sm:h-10' />

            <h3 className='font-bold text-xl sm:text-2xl mt-5'>
              Smart Matching
            </h3>

            <p className='text-gray-500 mt-3 text-sm sm:text-base leading-6'>
              AI-based route matching for faster pickup.
            </p>
          </div>

          {/* Safe */}
          <div
            className='
              bg-white
              rounded-2xl sm:rounded-3xl
              shadow-lg
              p-6 sm:p-8
              hover:scale-[1.02]
              sm:hover:scale-105
              transition
              duration-300
            '
          >
            <ShieldCheck className='text-green-500 w-9 h-9 sm:w-10 sm:h-10' />

            <h3 className='font-bold text-xl sm:text-2xl mt-5'>
              Safe & Secure
            </h3>

            <p className='text-gray-500 mt-3 text-sm sm:text-base leading-6'>
              Verified drivers with secure authentication.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        className='
          bg-yellow-400
          py-14 sm:py-20
          px-4
        '
      >
        <div className='max-w-5xl mx-auto text-center'>
          <h2
            className='
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-bold
            '
          >
            Ready to Ride?
          </h2>

          <p
            className='
              mt-4 sm:mt-5
              text-base
              sm:text-xl
              max-w-2xl
              mx-auto
            '
          >
            Join thousands of passengers using RideLink every day.
          </p>

          <Link
            to='/register'
            className='
              mt-7 sm:mt-10
              inline-block
              bg-black
              text-white
              px-7 sm:px-10
              py-3 sm:py-4
              rounded-full
              text-base sm:text-lg
              hover:bg-gray-900
              transition
            '
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;
