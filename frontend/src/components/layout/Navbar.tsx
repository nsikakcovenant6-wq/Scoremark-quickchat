import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed top-0 left-0 w-full z-50
            backdrop-blur-xl
            bg-white/5
            border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">

                <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-full
                    bg-orange-500
                    flex items-center justify-center">

                        <FaWhatsapp
                            className="text-white"
                            size={24}
                        />

                    </div>

                    <div>

                        <h2 className="text-2xl font-bold text-white">
                            ScoreMark
                        </h2>

                        <p className="text-orange-400 text-sm">
                            QuickChat
                        </p>

                    </div>

                </div>

                <button
                    className="bg-orange-500
                    hover:bg-orange-600
                    transition
                    px-6
                    py-3
                    rounded-xl
                    font-semibold"
                >
                    Dashboard
                </button>

            </div>
        </motion.nav>
    );
}