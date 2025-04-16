import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index, viewMode = 'grid', onQuickViewClick }) {
    const handleQuickView = (e) => {
        e.preventDefault();
        if (onQuickViewClick) {
            onQuickViewClick(product);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        console.log('Add to cart:', product);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                layout: { duration: 0.3 },
                opacity: { delay: 0.1 * (index || 0), duration: 0.3 }
            }}
        >
            <Link
                href={`/products/${product.category.toLowerCase()}/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`group relative overflow-hidden duration-300 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row gap-6'}`}
            >
                {/* Image Container with Hover Effect */}
                <div className={`aspect-square relative overflow-hidden ${viewMode === 'list' ? 'w-1/3' : 'w-full'}`}>
                    {/* Main Image */}
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />

                    {/* Hover Image */}
                    <Image
                        src={product.hoverImage || product.image}
                        alt={`${product.name} - hover`}
                        fill
                        className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                    />

                    {/* Action Buttons */}
                    <div className="absolute bottom-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex flex-row justify-center space-x-2">
                            <button
                                className="bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors p-2 shadow-lg"
                                onClick={handleQuickView}
                            >
                                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                                    <circle cx="10.5" cy="10.5" r="6.5" stroke="#000000" strokeLinejoin="round" />
                                    <path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="#000000" />
                                </svg>
                            </button>
                            <button
                                className="bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors p-2 shadow-lg"
                                onClick={handleAddToCart}
                            >
                                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                                    <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="#000000" strokeWidth="1.5" />
                                    <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="#000000" strokeWidth="1.5" />
                                    <path d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className={`flex-grow flex flex-col ${viewMode === 'grid' ? 'py-4 pb-8 justify-center items-center' : 'justify-center'}`}>
                    <h3 className={`text-lg font-medium mb-2 group-hover:text-[#00B0C8] transition-colors ${viewMode === 'grid' ? 'text-center' : ''}`}>
                        {product.name}
                    </h3>
                    <p className="text-md font-light text-primary">{product.price}</p>
                </div>
            </Link>
        </motion.div>
    );
} 