import { Users, MapPin, ShieldCheck, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Img from "/assets/ride.png";

function Landing() {
  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900'>
      <nav className='w-full border-b border-gray-100 bg-white'>
        <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex min-h-[68px] items-center justify-between gap-3 py-3 sm:min-h-[76px] sm:py-4'>
            <Link
              to='/'
              className='flex shrink-0 items-center'
              aria-label='RideLink Home'
            >
              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                Ride<span className='text-yellow-500'>Link</span>
              </h1>
            </Link>

            <div className='flex items-center gap-2 sm:gap-3 md:gap-4'>
              <Link
                to='/login'
                className='rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 active:scale-95 sm:px-6 sm:text-base'
              >
                Login
              </Link>

              <Link
                to='/register'
                className='rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold shadow-md transition hover:bg-yellow-500 active:scale-95 sm:px-6 sm:text-base'
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className='mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:gap-12 sm:px-6 sm:py-14 md:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20'>
        <div className='w-full min-w-0'>
          <div className='mb-5 inline-flex max-w-full items-center rounded-full bg-yellow-100 px-3 py-2 text-xs font-medium text-yellow-700 sm:mb-6 sm:px-4 sm:text-sm'>
            <span className='truncate'>🚖 Smart Shared Ride Platform</span>
          </div>

          <h1 className='max-w-3xl text-[2.45rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-6xl'>
            Share Rides.
            <br />
            Save Money.
            <br />
            Travel Smarter.
          </h1>

          <p className='mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:mt-7 sm:text-lg sm:leading-8'>
            RideLink connects passengers travelling in the same direction,
            reducing waiting time, lowering travel cost and helping drivers earn
            more through smart ride matching.
          </p>

          <div className='mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4'>
            <Link
              to='/register'
              className='flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-3.5 text-sm font-semibold shadow-lg transition hover:bg-yellow-500 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4 sm:text-base'
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to='/login'
              className='flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold transition hover:bg-gray-100 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4 sm:text-base'
            >
              Login
            </Link>
          </div>

          <div className='mt-9 grid grid-cols-3 gap-2.5 sm:mt-12 sm:gap-4 lg:gap-5'>
            <div className='min-w-0 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100 sm:p-5'>
              <Users className='h-5 w-5 text-yellow-500 sm:h-6 sm:w-6' />

              <h2 className='mt-2 text-xl font-bold sm:text-2xl'>0</h2>

              <p className='mt-0.5 truncate text-xs text-gray-500 sm:text-sm'>
                Riders
              </p>
            </div>

            <div className='min-w-0 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100 sm:p-5'>
              <ShieldCheck className='h-5 w-5 text-green-500 sm:h-6 sm:w-6' />

              <h2 className='mt-2 text-xl font-bold sm:text-2xl'>100%</h2>

              <p className='mt-0.5 truncate text-xs text-gray-500 sm:text-sm'>
                Verified
              </p>
            </div>

            <div className='min-w-0 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100 sm:p-5'>
              <Star className='h-5 w-5 fill-yellow-400 text-yellow-500 sm:h-6 sm:w-6' />

              <h2 className='mt-2 text-xl font-bold sm:text-2xl'>0</h2>

              <p className='mt-0.5 truncate text-xs text-gray-500 sm:text-sm'>
                Rating
              </p>
            </div>
          </div>
        </div>

        <div className='relative flex min-h-[330px] w-full items-center justify-center px-2 sm:min-h-[430px] sm:px-4 lg:min-h-[520px] lg:px-0'>
          <div className='absolute h-56 w-56 rounded-full bg-yellow-300 opacity-30 blur-3xl sm:h-80 sm:w-80 lg:h-96 lg:w-96' />

          <img
            src={Img}
            alt='RideLink'
            className='relative z-10 w-[260px] max-w-[82%] object-contain sm:w-[380px] sm:max-w-[90%] md:w-[450px] lg:w-[520px]'
          />

          <div className='absolute left-0 top-1 z-20 max-w-[155px] rounded-2xl bg-white p-3 shadow-lg ring-1 ring-gray-100 sm:left-1 sm:top-7 sm:max-w-[190px] sm:p-4 lg:left-0'>
            <div className='flex items-start gap-2'>
              <MapPin className='mt-0.5 shrink-0 text-red-500' size={19} />

              <div className='min-w-0'>
                <h3 className='text-sm font-semibold sm:text-base'>Pickup</h3>

                <p className='mt-0.5 truncate text-xs text-gray-500 sm:text-sm'>
                  GNIOT College
                </p>
              </div>
            </div>
          </div>

          <div className='absolute bottom-1 right-0 z-20 max-w-[175px] rounded-2xl bg-white p-3 shadow-lg ring-1 ring-gray-100 sm:bottom-7 sm:right-1 sm:max-w-[210px] sm:p-4 lg:right-0'>
            <p className='text-xs font-semibold sm:text-sm'>
              🚖 4 Seats Available
            </p>

            <p className='mt-1 text-xs leading-5 text-gray-500 sm:text-sm'>
              Driver arriving in 3 mins
            </p>
          </div>
        </div>
      </section>

      <section className='mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20'>
        <h2 className='mb-8 text-center text-3xl font-bold tracking-tight sm:mb-12 sm:text-4xl'>
          Why Choose RideLink?
        </h2>

        <div className='grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 md:gap-8'>
          <div className='rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8'>
            <Users className='h-9 w-9 text-yellow-500 sm:h-10 sm:w-10' />

            <h3 className='mt-5 text-xl font-bold sm:text-2xl'>Shared Rides</h3>

            <p className='mt-3 text-sm leading-6 text-gray-500 sm:text-base'>
              Travel with people going in the same direction.
            </p>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8'>
            <MapPin className='h-9 w-9 text-red-500 sm:h-10 sm:w-10' />

            <h3 className='mt-5 text-xl font-bold sm:text-2xl'>
              Smart Matching
            </h3>

            <p className='mt-3 text-sm leading-6 text-gray-500 sm:text-base'>
              AI-based route matching for faster pickup.
            </p>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8'>
            <ShieldCheck className='h-9 w-9 text-green-500 sm:h-10 sm:w-10' />

            <h3 className='mt-5 text-xl font-bold sm:text-2xl'>
              Safe & Secure
            </h3>

            <p className='mt-3 text-sm leading-6 text-gray-500 sm:text-base'>
              Verified drivers with secure authentication.
            </p>
          </div>
        </div>
      </section>

      <section className='bg-yellow-400 px-4 py-12 sm:py-16 lg:py-20'>
        <div className='mx-auto max-w-5xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
            Ready to Ride?
          </h2>

          <p className='mx-auto mt-4 max-w-2xl text-base leading-7 sm:mt-5 sm:text-xl sm:leading-8'>
            Join thousands of passengers using RideLink every day.
          </p>

          <Link
            to='/register'
            className='mt-7 inline-flex items-center justify-center rounded-full bg-black px-7 py-3.5 text-base font-semibold text-white transition hover:bg-gray-900 active:scale-[0.98] sm:mt-9 sm:px-10 sm:py-4 sm:text-lg'
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;
