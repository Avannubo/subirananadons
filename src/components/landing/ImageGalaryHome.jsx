import Image from 'next/image';
import Link from 'next/link';

const ImageGallery = () => {
    const galleryItems = [
        {
            id: 1,
            title: 'Joolz',
            description: 'Descubre nuestros productos Joolz',
            imageUrl: '/assets/images/joolz.png',
            width: 60,
            href: "/brands?brand=Joolz"
        },
        {
            id: 2,
            title: 'Stokke',
            description: 'Explora la colección Stokke',
            imageUrl: '/assets/images/stokke.png',
            width: 40,
            href: "/brands?brand=Stokke"
        },
        {
            id: 3,
            title: 'Bugaboo',
            description: 'Los mejores productos Bugaboo',
            imageUrl: '/assets/images/bugaboo.jpg',
            width: 40,
            href: "/brands?brand=Bugaboo"
        },
        {
            id: 4,
            title: 'Joie',
            description: 'Colección completa de Joie',
            imageUrl: '/assets/images/joie.png',
            width: 60,
            href: "/brands?brand=Joie"
        }
    ];

    return (
        <div className="w-full overflow-hidden bg-white">
            <div className="container w-[1400px] mt-20 mx-auto py-12">
                {/* First Row - 60/40 Split */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {galleryItems.slice(0, 2).map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`relative rounded-lg overflow-hidden ${item.width === 60 ? 'md:w-3/5' : 'md:w-2/5'}`}
                            style={{ height: '420px' }}
                        >
                            <div className="relative w-full h-full group  ">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-end p-6 transition-colors duration-300 group-hover:bg-black/30">
                                    <div className="text-white">
                                        <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-white/90">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Second Row - 40/60 Split (reversed) */}
                <div className="flex flex-col md:flex-row gap-6">
                    {galleryItems.slice(2, 4).map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`relative rounded-lg overflow-hidden ${item.width === 60 ? 'md:w-3/5' : 'md:w-2/5'}`}
                            style={{ height: '400px' }}
                        >
                            <div className="relative w-full h-full group">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 flex rounded-lg items-end p-6 group-hover:bg-black/30 transition-colors duration-300">
                                    <div className="text-white">
                                        <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-white/90">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageGallery;