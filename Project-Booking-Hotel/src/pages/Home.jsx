import { BookForm, HeroSlider, Rooms, ScrollToTop } from '../components';
import { useRoomContext } from '../context/RoomContext';

const Home = () => {
  const { updateSearch } = useRoomContext();

  return (
    <div>
      <ScrollToTop />

      <HeroSlider />

      <div className='container mx-auto relative'>

        <div className='bg-accent/20 mt-4 p-4 lg:absolute lg:left-0 lg:right-0 lg:p-0 lg:-top-12 lg:z-30 lg:shadow-xl'>
          {/* Real-time Search Bar - integrated with BookForm */}
          <div className='mb-4 lg:mb-0'>
            <input
              type='text'
              placeholder='Search rooms by name, description...'
              className='w-full bg-white border border-accent/20 px-6 py-4 focus:outline-none focus:border-accent text-primary placeholder:text-primary/50 rounded-lg'
              onChange={(e) => {
                if (updateSearch) {
                  updateSearch(e.target.value);
                }
              }}
            />
          </div>
          
          <BookForm />
        </div>

      </div>

      <Rooms />
    </div>
  );
};

export default Home;
