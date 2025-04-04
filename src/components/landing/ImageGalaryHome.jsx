import Image from 'next/image';

const ImageGallery = () => {
    const galleryItems = [
        {
            id: 1,
            // title: 'Premium Collection',
            // description: 'Explore our exclusive designs',
            imageUrl: '/assets/images/joolz.png',
            width: 60
        },
        {
            id: 2,
            // title: 'Summer Edition',
            // description: 'New arrivals just for you',
            imageUrl: '/assets/images/stokke.png',
            width: 40
        },
        {
            id: 3,
            // title: 'Limited Offers',
            // description: 'Special discounts available',
            imageUrl: '/assets/images/bugaboo.jpg',
            width: 40
        },
        {
            id: 4,
            // title: 'Baby Essentials',
            // description: 'Everything you need',
            imageUrl: '/assets/images/joie.png',
            width: 60
        }
    ];

    return (
        <div className="w-screen  bg-white">
            <div className="container w-[1300px] mt-20 mx-auto py-12">
                {/* First Row - 60/40 Split */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {galleryItems.slice(0, 2).map((item) => (
                        <div
                            key={item.id}
                            className={`relative overflow-hidden ${item.width === 60 ? 'md:w-3/5' : 'md:w-2/5'}`}
                            style={{ height: '420px' }}
                        >
                            <div className="relative w-full h-full group">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0  flex items-end p-6 transition-colors duration-300">
                                    <div className="text-white">
                                        <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-white/90">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Second Row - 40/60 Split (reversed) */}
                <div className="flex flex-col md:flex-row gap-6">
                    {galleryItems.slice(2, 4).map((item) => (
                        <div
                            key={item.id}
                            className={`relative overflow-hidden ${item.width === 60 ? 'md:w-3/5' : 'md:w-2/5'}`}
                            style={{ height: '400px' }}
                        >
                            <div className="relative w-full h-full group">
                                <Image
                                    src={item.imageUrl}
                                    alt="img"
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-end p-6 group-hover:bg-black/30 transition-colors duration-300">
                                    <div className="text-white">
                                        <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-white/90">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageGallery;